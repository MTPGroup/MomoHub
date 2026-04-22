import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  getPublicCharacterOptions,
  getPublicCharacterQueryKey,
  updateCharacterMutation,
} from '#/client/@tanstack/react-query.gen'
import type { AuthState } from '#/stores/auth'
import { buildGenerationParams } from '#/utils/character'

export function useTuning({ id, auth }: { id: string; auth: AuthState }) {
  const queryClient = useQueryClient()

  const [systemPromptDraft, setSystemPromptDraft] = useState('')
  const [temperatureInput, setTemperatureInput] = useState('')
  const [topPInput, setTopPInput] = useState('')
  const [maxTokensInput, setMaxTokensInput] = useState('')
  const [presencePenaltyInput, setPresencePenaltyInput] = useState('')
  const [frequencyPenaltyInput, setFrequencyPenaltyInput] = useState('')
  const [tuningDialogOpen, setTuningDialogOpen] = useState(false)

  const characterQuery = useQuery({
    ...getPublicCharacterOptions({
      path: { id },
    }),
  })
  const character = characterQuery.data?.data

  useEffect(() => {
    if (!character) return
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

  const generationParams = useMemo(() => {
    return (
      buildGenerationParams({
        temperature: temperatureInput,
        topP: topPInput,
        maxTokens: maxTokensInput,
        presencePenalty: presencePenaltyInput,
        frequencyPenalty: frequencyPenaltyInput,
      }) ?? {}
    )
  }, [
    temperatureInput,
    topPInput,
    maxTokensInput,
    presencePenaltyInput,
    frequencyPenaltyInput,
  ])

  const saveTuning = useMutation({
    ...updateCharacterMutation(),
    onSuccess: () => {
      toast.success('角色调参已保存')
      queryClient.invalidateQueries({
        queryKey: getPublicCharacterQueryKey({
          path: { id },
        }),
      })
    },
    onError: (err) => {
      toast.error('保存失败', { description: err.message || '请稍后重试' })
    },
  })

  const handleSaveTuning = () => {
    if (!auth.user || !character) return toast.error('请先登录或等待加载')
    saveTuning.mutate({
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
  }

  const applyGenerationParamInputs = (
    params?: Record<string, unknown> | null,
  ) => {
    const getNumStr = (val: unknown) =>
      typeof val === 'number' && Number.isFinite(val) ? String(val) : ''
    setTemperatureInput(getNumStr(params?.temperature))
    setTopPInput(getNumStr(params?.topP))
    setMaxTokensInput(getNumStr(params?.maxTokens))
    setPresencePenaltyInput(getNumStr(params?.presencePenalty))
    setFrequencyPenaltyInput(getNumStr(params?.frequencyPenalty))
  }

  return {
    character,
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
    tuningDialogOpen,
    setTuningDialogOpen,
    generationParams,
    applyGenerationParamInputs,
    isSavingTuning: saveTuning.isPending,
    handleSaveTuning,
  }
}
