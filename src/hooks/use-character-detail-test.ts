import { useChat } from '@ai-sdk/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TextStreamChatTransport } from 'ai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getPublicCharacterOptions,
  getPublicCharacterQueryKey,
  updateCharacterMutation,
} from '#/client/@tanstack/react-query.gen'
import {
  createChat,
  deleteChat,
  exportChat,
  importChat,
  listMessages,
  updateChat,
} from '#/client/sdk.gen'
import { siteConfig } from '#/env'
import { getAccessToken, useAuth } from '#/stores/auth'
import {
  buildGenerationParams,
  extractLatestUserText,
  getChatRuntimeConfig,
  getConfigSignature,
  openAiSseToTextStream,
} from '../utils/character-test'

const TEMP_CHAT_TTL_MS = 2 * 60 * 60 * 1000

export function useCharacterDetailTest(id: string) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const authTokenRef = useRef('')
  const llmConfigIdRef = useRef('')
  const generationParamsRef = useRef<Record<string, unknown>>({})
  const tempChatIdRef = useRef('')
  const pendingParamSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const pendingParamSyncPromiseRef = useRef<Promise<void> | null>(null)
  const lastAppliedConfigSignatureRef = useRef('')

  const [message, setMessage] = useState('')
  const [llmConfigId, setLlmConfigId] = useState('')
  const [systemPromptDraft, setSystemPromptDraft] = useState('')
  const [temperatureInput, setTemperatureInput] = useState('')
  const [topPInput, setTopPInput] = useState('')
  const [maxTokensInput, setMaxTokensInput] = useState('')
  const [presencePenaltyInput, setPresencePenaltyInput] = useState('')
  const [frequencyPenaltyInput, setFrequencyPenaltyInput] = useState('')
  const [tuningDialogOpen, setTuningDialogOpen] = useState(false)
  const [tempChatId, setTempChatId] = useState('')
  const [hasPendingSessionParamChanges, setHasPendingSessionParamChanges] =
    useState(false)
  const [isSyncingSessionParams, setIsSyncingSessionParams] = useState(false)
  const [appliedParams, setAppliedParams] = useState<Record<string, unknown>>(
    {},
  )
  const [tempChatExpiresAt, setTempChatExpiresAt] = useState('')

  const applyGenerationParamInputs = useCallback(
    (params?: Record<string, unknown> | null) => {
      const getNumberText = (value: unknown) =>
        typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
      setTemperatureInput(getNumberText(params?.temperature))
      setTopPInput(getNumberText(params?.topP))
      setMaxTokensInput(getNumberText(params?.maxTokens))
      setPresencePenaltyInput(getNumberText(params?.presencePenalty))
      setFrequencyPenaltyInput(getNumberText(params?.frequencyPenalty))
    },
    [],
  )

  const {
    messages,
    sendMessage: sendChatMessage,
    setMessages,
    stop,
    status,
    error,
  } = useChat({
    id: `character-detail-test-${id}`,
    transport: new TextStreamChatTransport({
      api: `${siteConfig.links.api}/api/v1/chats/__placeholder__/messages`,
      prepareSendMessagesRequest: async ({ messages, headers }) => {
        const accessToken = authTokenRef.current || getAccessToken()
        if (!accessToken) {
          throw new Error('请先登录')
        }

        let currentChatId = tempChatIdRef.current
        if (!currentChatId) {
          const expiresAt = new Date(
            Date.now() + TEMP_CHAT_TTL_MS,
          ).toISOString()
          const created = await createChat({
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: {
              characterId: id,
              isTemporary: true,
              expiresAt,
            },
            throwOnError: true,
          })
          const chat = created.data?.data
          if (!chat?.id) {
            throw new Error('创建临时会话失败，未返回会话ID')
          }
          currentChatId = chat.id
          tempChatIdRef.current = currentChatId
          setTempChatId(currentChatId)
          setTempChatExpiresAt(chat.expiresAt || '')
          setHasPendingSessionParamChanges(true)
        }

        return {
          api: `${siteConfig.links.api}/api/v1/chats/${currentChatId}/messages`,
          headers: {
            ...(headers ?? {}),
            Accept: 'text/event-stream',
          },
          body: {
            content: extractLatestUserText(messages),
          },
        }
      },
      fetch: async (input, init) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url
        const response = await fetch(input, init)
        const contentType = response.headers.get('content-type')?.toLowerCase()

        if (contentType?.includes('text/html')) {
          throw new Error(
            `详情测试接口返回了 HTML（可能命中前端路由）：${requestUrl}`,
          )
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `请求失败（HTTP ${response.status}）`)
        }

        if (!response.body) {
          throw new Error('流式响应为空，请检查后端接口输出')
        }

        return new Response(openAiSseToTextStream(response.body), {
          status: response.status,
          statusText: response.statusText,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      },
    }),
  })

  const isStreaming = status === 'submitted' || status === 'streaming'

  const characterQuery = useQuery({
    ...getPublicCharacterOptions({
      headers: auth.accessToken
        ? {
            Authorization: `Bearer ${auth.accessToken}`,
          }
        : undefined,
      path: { id },
    }),
  })

  const character = characterQuery.data?.data
  const saveTuning = useMutation({
    ...updateCharacterMutation(),
    onSuccess: () => {
      toast.success('角色调参已保存')
      queryClient.invalidateQueries({
        queryKey: getPublicCharacterQueryKey({
          headers: auth.accessToken
            ? {
                Authorization: `Bearer ${auth.accessToken}`,
              }
            : undefined,
          path: { id },
        }),
      })
    },
    onError: (mutationError) => {
      toast.error('保存角色调参失败', {
        description: mutationError.message || '请稍后重试',
      })
    },
  })

  const chatMessages = useMemo(
    () =>
      messages.filter(
        (item) => item.role === 'user' || item.role === 'assistant',
      ),
    [messages],
  )

  const draftRuntimeConfig = useMemo(
    () =>
      getChatRuntimeConfig({
        llmConfigId,
        generationParams:
          buildGenerationParams({
            temperature: temperatureInput,
            topP: topPInput,
            maxTokens: maxTokensInput,
            presencePenalty: presencePenaltyInput,
            frequencyPenalty: frequencyPenaltyInput,
          }) ?? {},
      }),
    [
      llmConfigId,
      temperatureInput,
      topPInput,
      maxTokensInput,
      presencePenaltyInput,
      frequencyPenaltyInput,
    ],
  )
  const draftConfigSignature = useMemo(
    () => getConfigSignature(draftRuntimeConfig),
    [draftRuntimeConfig],
  )

  const clearTemporarySessionState = useCallback(() => {
    if (pendingParamSyncTimerRef.current) {
      clearTimeout(pendingParamSyncTimerRef.current)
      pendingParamSyncTimerRef.current = null
    }
    pendingParamSyncPromiseRef.current = null
    lastAppliedConfigSignatureRef.current = ''
    setTempChatId('')
    tempChatIdRef.current = ''
    setTempChatExpiresAt('')
    setAppliedParams({})
    setHasPendingSessionParamChanges(false)
    setMessages([])
  }, [setMessages])

  const resetTemporarySession = useCallback(() => {
    stop()
    clearTemporarySessionState()
    toast.success('已重置临时会话，下次发送将创建新会话')
  }, [clearTemporarySessionState, stop])

  const deleteTemporarySession = useCallback(async () => {
    const accessToken = authTokenRef.current || getAccessToken()
    if (!accessToken) {
      toast.error('请先登录')
      return
    }

    const chatId = tempChatIdRef.current
    if (!chatId) {
      toast.error('当前没有可删除的临时会话')
      return
    }

    stop()
    try {
      await deleteChat({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        path: { id: chatId },
        throwOnError: true,
      })
      clearTemporarySessionState()
      toast.success('临时会话已删除')
    } catch (error) {
      toast.error('删除临时会话失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }, [clearTemporarySessionState, stop])

  const syncSessionParams = useCallback(async (chatId: string) => {
    const accessToken = authTokenRef.current || getAccessToken()
    if (!accessToken) {
      throw new Error('请先登录')
    }
    const runtimeConfig = getChatRuntimeConfig({
      llmConfigId: llmConfigIdRef.current,
      generationParams: generationParamsRef.current,
    })
    const signature = getConfigSignature(runtimeConfig)
    if (signature === lastAppliedConfigSignatureRef.current) {
      setHasPendingSessionParamChanges(false)
      return
    }
    setIsSyncingSessionParams(true)
    try {
      await updateChat({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        path: { id: chatId },
        body: runtimeConfig,
        throwOnError: true,
      })
      lastAppliedConfigSignatureRef.current = signature
      setAppliedParams(runtimeConfig.settings.generationParams ?? {})
      setHasPendingSessionParamChanges(false)
    } finally {
      setIsSyncingSessionParams(false)
    }
  }, [])

  const flushPendingSessionParamSync = useCallback(async () => {
    const chatId = tempChatIdRef.current
    if (!chatId) return

    if (pendingParamSyncTimerRef.current) {
      clearTimeout(pendingParamSyncTimerRef.current)
      pendingParamSyncTimerRef.current = null
      const immediate = syncSessionParams(chatId).catch(
        (syncError: unknown) => {
          setHasPendingSessionParamChanges(true)
          throw syncError
        },
      )
      pendingParamSyncPromiseRef.current = immediate
    }

    if (pendingParamSyncPromiseRef.current) {
      await pendingParamSyncPromiseRef.current
    }
  }, [syncSessionParams])

  useEffect(() => {
    authTokenRef.current = auth.accessToken
  }, [auth.accessToken])

  useEffect(() => {
    llmConfigIdRef.current = llmConfigId.trim()
  }, [llmConfigId])

  useEffect(() => {
    if (!character) {
      return
    }
    setSystemPromptDraft(character.systemPrompt || '')
    const base = character.baseConfig
    setTemperatureInput(
      base?.temperature !== undefined ? String(base.temperature) : '',
    )
    setTopPInput(base?.topP !== undefined ? String(base.topP) : '')
    setMaxTokensInput(
      base?.maxTokens !== undefined ? String(base.maxTokens) : '',
    )
    setPresencePenaltyInput(
      base?.presencePenalty !== undefined ? String(base.presencePenalty) : '',
    )
    setFrequencyPenaltyInput(
      base?.frequencyPenalty !== undefined ? String(base.frequencyPenalty) : '',
    )
  }, [character])

  useEffect(() => {
    const generationParams = buildGenerationParams({
      temperature: temperatureInput,
      topP: topPInput,
      maxTokens: maxTokensInput,
      presencePenalty: presencePenaltyInput,
      frequencyPenalty: frequencyPenaltyInput,
    })
    generationParamsRef.current =
      generationParams && generationParams !== null ? generationParams : {}
  }, [
    temperatureInput,
    topPInput,
    maxTokensInput,
    presencePenaltyInput,
    frequencyPenaltyInput,
  ])

  useEffect(() => {
    void draftConfigSignature
    const chatId = tempChatId
    if (!chatId) return

    setHasPendingSessionParamChanges(true)
    if (pendingParamSyncTimerRef.current) {
      clearTimeout(pendingParamSyncTimerRef.current)
    }
    pendingParamSyncTimerRef.current = setTimeout(() => {
      pendingParamSyncPromiseRef.current = syncSessionParams(chatId).catch(
        (syncError: unknown) => {
          setHasPendingSessionParamChanges(true)
          toast.error('会话参数更新失败', {
            description:
              syncError instanceof Error ? syncError.message : '请稍后重试',
          })
        },
      )
    }, 400)
  }, [tempChatId, draftConfigSignature, syncSessionParams])

  useEffect(() => {
    if (!error) return
    toast.error('详情测试失败', {
      description: error.message || '请稍后重试',
    })
  }, [error])

  const handleSaveTuning = useCallback(() => {
    if (!auth.accessToken) {
      toast.error('请先登录')
      return
    }
    if (!character) {
      toast.error('角色信息尚未加载完成')
      return
    }

    const generationParams = buildGenerationParams({
      temperature: temperatureInput,
      topP: topPInput,
      maxTokens: maxTokensInput,
      presencePenalty: presencePenaltyInput,
      frequencyPenalty: frequencyPenaltyInput,
    })
    if (generationParams === null) {
      toast.error('生成参数格式不正确，请输入有效数字')
      return
    }

    saveTuning.mutate({
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      path: { id: character.id },
      body: {
        name: character.name,
        bio: character.bio || '',
        systemPrompt: systemPromptDraft.trim() || '',
        baseConfig:
          Object.keys(generationParams).length > 0 ? generationParams : null,
        tags: character.tags ?? [],
        isPublic: Boolean(character.isPublic),
        status: character.status || 'active',
      },
    })
  }, [
    auth.accessToken,
    character,
    frequencyPenaltyInput,
    maxTokensInput,
    presencePenaltyInput,
    saveTuning,
    systemPromptDraft,
    temperatureInput,
    topPInput,
  ])

  const sendDetailTest = useCallback(async () => {
    const text = message.trim()
    if (!text) {
      toast.error('请输入测试消息')
      return
    }
    if (!auth.accessToken) {
      toast.error('请先登录')
      return
    }

    const generationParams = buildGenerationParams({
      temperature: temperatureInput,
      topP: topPInput,
      maxTokens: maxTokensInput,
      presencePenalty: presencePenaltyInput,
      frequencyPenalty: frequencyPenaltyInput,
    })
    if (generationParams === null) {
      toast.error('生成参数格式不正确，请输入有效数字')
      return
    }
    generationParamsRef.current = generationParams
    llmConfigIdRef.current = llmConfigId.trim()
    setMessage('')

    try {
      await flushPendingSessionParamSync()
      await sendChatMessage(
        { text },
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: {
            llmConfigId: llmConfigIdRef.current || undefined,
            generationParams,
          },
        },
      )
    } catch (sendError) {
      toast.error('详情测试失败', {
        description:
          sendError instanceof Error ? sendError.message : '请稍后重试',
      })
    }
  }, [
    auth.accessToken,
    flushPendingSessionParamSync,
    frequencyPenaltyInput,
    llmConfigId,
    maxTokensInput,
    message,
    presencePenaltyInput,
    sendChatMessage,
    temperatureInput,
    topPInput,
  ])

  const exportDetailTestChat = useCallback(async () => {
    const accessToken = auth.accessToken
    if (!accessToken) {
      toast.error('请先登录')
      return
    }
    const chatId = tempChatIdRef.current
    if (!chatId) {
      toast.error('当前没有可导出的测试会话')
      return
    }

    try {
      const response = await exportChat({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        path: { id: chatId },
        throwOnError: true,
      })
      const payload = response.data?.data
      if (!payload) {
        throw new Error('导出结果为空')
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `character-detail-test-${chatId}-${Date.now()}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(downloadUrl)

      toast.success('测试会话已导出')
    } catch (error) {
      toast.error('导出会话失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }, [auth.accessToken])

  const importDetailTestChat = useCallback(async () => {
    const accessToken = auth.accessToken
    if (!accessToken) {
      toast.error('请先登录')
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        return
      }

      try {
        const raw = await file.text()
        const parsed = JSON.parse(raw) as {
          version?: string
          chat?: {
            characterId: string
            title?: string | null
            contextWindow?: number
            llmConfigId?: string | null
            isTemporary?: boolean
            expiresAt?: string | null
            settings?: { generationParams?: Record<string, unknown> | null }
          }
          messages?: Array<{
            id?: string | null
            parentId?: string | null
            runId?: string | null
            role: string
            content?: string | null
            parts?: Array<{ [key: string]: unknown }>
            contentType?: string
            status?: string
            model?: string | null
            tokensUsed?: number | null
            latencyMs?: number | null
            generationParams?: { [key: string]: unknown }
            createdAt?: string | null
          }>
        }

        if (!parsed.chat?.characterId) {
          throw new Error('导入文件缺少 chat.characterId')
        }

        const importResult = await importChat({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            version: parsed.version,
            chat: parsed.chat,
            messages: parsed.messages ?? [],
            overrideCharacterId:
              parsed.chat.characterId === id ? undefined : id,
          },
          throwOnError: true,
        })

        const importedChat = importResult.data?.data?.chat
        if (!importedChat?.id) {
          throw new Error('导入成功但未返回会话ID')
        }

        if (pendingParamSyncTimerRef.current) {
          clearTimeout(pendingParamSyncTimerRef.current)
          pendingParamSyncTimerRef.current = null
        }
        pendingParamSyncPromiseRef.current = null

        tempChatIdRef.current = importedChat.id
        setTempChatId(importedChat.id)
        setTempChatExpiresAt(importedChat.expiresAt || '')

        const importedParams =
          importedChat.settings?.generationParams ??
          ({} as Record<string, unknown>)
        setAppliedParams(importedParams)
        setHasPendingSessionParamChanges(false)
        llmConfigIdRef.current = importedChat.llmConfigId || ''
        setLlmConfigId(importedChat.llmConfigId || '')
        applyGenerationParamInputs(importedParams)

        lastAppliedConfigSignatureRef.current = getConfigSignature(
          getChatRuntimeConfig({
            llmConfigId: importedChat.llmConfigId || '',
            generationParams: importedParams,
          }),
        )

        const messageResult = await listMessages({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          path: { id: importedChat.id },
          query: { page: 1, page_size: 200 },
          throwOnError: true,
        })
        const importedMessages = messageResult.data?.data?.items ?? []
        setMessages(
          importedMessages.map((item) => {
            const partText = (item.parts ?? [])
              .map((part) => {
                if (!part || typeof part !== 'object') return ''
                const candidate = part as { type?: string; text?: string }
                if (
                  candidate.type === 'text' &&
                  typeof candidate.text === 'string'
                ) {
                  return candidate.text
                }
                return ''
              })
              .join('')

            return {
              id: item.id,
              role: item.role as 'user' | 'assistant' | 'system',
              parts: [
                {
                  type: 'text' as const,
                  text: partText || item.content || '',
                },
              ],
            }
          }),
        )

        toast.success('测试会话已导入')
      } catch (error) {
        toast.error('导入会话失败', {
          description:
            error instanceof Error ? error.message : '请检查导入文件格式',
        })
      }
    }

    input.click()
  }, [applyGenerationParamInputs, auth.accessToken, id, setMessages])

  return {
    auth,
    character,
    chatMessages,
    message,
    setMessage,
    isStreaming,
    stop,
    tempChatId,
    tempChatExpiresAt,
    tuningDialogOpen,
    setTuningDialogOpen,
    llmConfigId,
    setLlmConfigId,
    systemPromptDraft,
    setSystemPromptDraft,
    temperatureInput,
    setTemperatureInput,
    topPInput,
    setTopPInput,
    maxTokensInput,
    setMaxTokensInput,
    presencePenaltyInput,
    setPresencePenaltyInput,
    frequencyPenaltyInput,
    setFrequencyPenaltyInput,
    isSyncingSessionParams,
    hasPendingSessionParamChanges,
    appliedParams,
    isSavingTuning: saveTuning.isPending,
    resetTemporarySession,
    deleteTemporarySession,
    handleSaveTuning,
    sendDetailTest,
    exportDetailTestChat,
    importDetailTestChat,
  }
}

export type CharacterDetailTestState = ReturnType<typeof useCharacterDetailTest>
