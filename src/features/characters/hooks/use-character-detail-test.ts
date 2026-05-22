import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
  createChat,
  deleteChat,
  exportChat,
  importChat,
  listMessages,
} from '#/client/sdk.gen'
import { siteConfig } from '#/env'
import { useCharacterKnowledgeBinding } from '#/features/characters/hooks/use-character-knowledge-binding'
import { useAuth } from '#/hooks/use-auth'
import {
  extractLatestUserText,
  getChatRuntimeConfig,
  getConfigSignature,
  openAiSseToTextStream,
} from '#/utils/character'
import {
  mapImportedMessagesToUiMessages,
  parseImportedChatPayload,
} from '#/utils/detail-test-import'

import { useSessionParamSync } from './use-session-param-sync'
import { useTempChatSession } from './use-temp-chat-session'
import { useTuning } from './use-tuning'

const TEMP_CHAT_TTL_MS = 2 * 60 * 60 * 1000

export function useCharacterDetailTest(id: string) {
  const auth = useAuth()

  const knowledgeBinding = useCharacterKnowledgeBinding({
    characterId: id,
    isAuthenticated: auth.isLoggedIn,
  })
  const tuning = useTuning({ id, auth })
  const session = useTempChatSession()
  const paramSync = useSessionParamSync({
    chatId: session.tempChatId,
    auth,
    generationParams: tuning.generationParams,
  })
  const [knowledgeBindingDialogOpen, setKnowledgeBindingDialogOpen] =
    useState(false)
  const [isSyncingSessionParams, setIsSyncingSessionParams] = useState(false)

  const [message, setMessage] = useState('')
  const chatEngine = useChat({
    id: `character-detail-test-${id}`,
    transport: new TextStreamChatTransport({
      api: `${siteConfig.links.api}/api/v1/chats/__placeholder__/messages`,
      prepareSendMessagesRequest: async ({ messages, headers }) => {
        if (!auth.isLoggedIn) throw new Error('请先登录')

        let currentChatId = session.tempChatIdRef.current
        if (!currentChatId) {
          const expiresAt = new Date(
            Date.now() + TEMP_CHAT_TTL_MS,
          ).toISOString()
          const created = await createChat({
            body: { characterId: id, isTemporary: true, expiresAt },
            throwOnError: true,
          })
          const chat = created.data?.data
          if (!chat?.id) throw new Error('创建临时会话失败')

          currentChatId = chat.id
          session.setSession(chat.id, chat.expiresAt || '')
          paramSync.markPending() // 通知参数同步模块有新会话
        }

        return {
          api: `${siteConfig.links.api}/api/v1/chats/${currentChatId}/messages`,
          headers: { ...(headers ?? {}), Accept: 'text/event-stream' },
          body: { content: extractLatestUserText(messages) },
        }
      },
      fetch: async (input, init) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url
        const response = await fetch(input, {
          ...init,
          credentials: 'include',
        })
        const contentType = response.headers.get('content-type')?.toLowerCase()
        if (contentType?.includes('text/html'))
          throw new Error(`详情测试接口返回了 HTML：${requestUrl}`)
        if (!response.ok)
          throw new Error(
            (await response.text()) || `请求失败（HTTP ${response.status}）`,
          )
        if (!response.body) throw new Error('流式响应为空')

        return new Response(openAiSseToTextStream(response.body), {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    }),
    onError: (err) =>
      toast.error('详情测试失败', { description: err.message || '请重试' }),
  })

  const sendDetailTest = async () => {
    if (!message.trim()) return toast.error('请输入测试消息')
    if (!auth.isLoggedIn) return toast.error('请先登录')

    try {
      await paramSync.flushSync()
      await chatEngine.sendMessage(
        { text: message },
        {
          body: { generationParams: tuning.generationParams },
        },
      )
      setMessage('')
    } catch (error) {
      toast.error('发送失败', {
        description: error instanceof Error ? error.message : '请重试',
      })
    }
  }

  const resetTemporarySession = () => {
    chatEngine.stop()
    chatEngine.setMessages([])
    session.clearSession()
    toast.success('已重置会话，下次发送将创建新会话')
  }

  const deleteTemporarySession = async () => {
    if (!auth.isLoggedIn) return toast.error('请先登录')
    if (!session.tempChatId) return toast.error('当前没有可删除的临时会话')
    chatEngine.stop()
    try {
      await deleteChat({
        path: { id: session.tempChatId },
        throwOnError: true,
      })
      chatEngine.setMessages([])
      session.clearSession()
      toast.success('临时会话已删除')
    } catch (err) {
      toast.error('删除失败', {
        description: err instanceof Error ? err.message : '请重试',
      })
    }
  }

  const exportDetailTestChat = useCallback(async () => {
    if (!auth.isLoggedIn) {
      toast.error('请先登录')
      return
    }
    const chatId = session.tempChatIdRef.current
    if (!chatId) {
      toast.error('当前没有可导出的测试会话')
      return
    }

    try {
      const response = await exportChat({
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
  }, [auth.isLoggedIn, session.tempChatIdRef])

  const importDetailTestChat = async () => {
    if (!auth.isLoggedIn) return toast.error('请先登录')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const raw = await file.text()
        const parsed = parseImportedChatPayload(raw)

        if (!parsed.chat?.characterId) {
          throw new Error('导入文件缺少 chat.characterId')
        }

        const importResult = await importChat({
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
        if (!importedChat?.id) throw new Error('导入成功但未返回ID')

        session.setSession(importedChat.id, importedChat.expiresAt || '')

        const importedParams = importedChat.settings?.generationParams ?? {}
        tuning.applyGenerationParamInputs(importedParams)
        paramSync.forceSetApplied(
          importedParams,
          getConfigSignature(
            getChatRuntimeConfig({ generationParams: importedParams }),
          ),
        )

        const messageResult = await listMessages({
          path: { id: importedChat.id },
          query: { page: 1, page_size: 200 },
          throwOnError: true,
        })

        chatEngine.setMessages(
          mapImportedMessagesToUiMessages(
            messageResult.data?.data?.items ?? [],
          ),
        )
        toast.success('测试会话已导入')
      } catch (err) {
        toast.error('导入失败', {
          description: err instanceof Error ? err.message : '请检查文件',
        })
      }
    }
    input.click()
  }

  return {
    auth,
    ...tuning,
    ...session,
    ...paramSync,
    hasPendingSessionParamChanges: paramSync.hasPendingChanges,
    ...knowledgeBinding,
    message,
    setMessage,
    chatMessages: chatEngine.messages.filter(
      (m) => m.role === 'user' || m.role === 'assistant',
    ),
    isStreaming:
      chatEngine.status === 'submitted' || chatEngine.status === 'streaming',
    stop: chatEngine.stop,
    sendDetailTest,
    resetTemporarySession,
    deleteTemporarySession,
    exportDetailTestChat,
    importDetailTestChat,
    knowledgeBindingDialogOpen,
    setKnowledgeBindingDialogOpen,
    isSyncingSessionParams,
    setIsSyncingSessionParams,
  }
}

export type CharacterDetailTestState = ReturnType<typeof useCharacterDetailTest>
