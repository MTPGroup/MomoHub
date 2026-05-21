import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { LlmConfigOut } from '#/client'
import {
  createLlmConfigMutation,
  deleteLlmConfigMutation,
  listMyLlmConfigsOptions,
  listMyLlmConfigsQueryKey,
  updateLlmConfigMutation,
} from '#/client/@tanstack/react-query.gen'

export function useLlmConfigs(enabled: boolean) {
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4.1')
  const [baseUrl, setBaseUrl] = useState('')

  const [editingId, setEditingId] = useState<string>('')

  const queryClient = useQueryClient()

  const llmConfigsQuery = useQuery({
    ...listMyLlmConfigsOptions(),
    enabled,
  })

  const llmConfigs =
    (llmConfigsQuery.data as { data?: LlmConfigOut[] | null } | undefined)
      ?.data ?? []

  const createLlmConfig = useMutation({
    ...createLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已创建')
      setName('')
      setProvider('openai')
      setModel('gpt-4.1')
      setBaseUrl('')
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const updateLlmConfig = useMutation({
    ...updateLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已更新')
      setEditingId('')
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteLlmConfig = useMutation({
    ...deleteLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已删除')
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const handleCreateLlmConfig = () => {
    if (!name.trim() || !provider.trim() || !model.trim()) {
      toast.error('请填写完整模型配置')
      return
    }

    createLlmConfig.mutate({
      body: {
        name: name.trim(),
        provider: provider.trim(),
        model: model.trim(),
        baseUrl: baseUrl.trim() || null,
      },
    })
  }

  const handleUpdateLlmConfig = () => {
    if (!editingId) return
    if (!name.trim() || !provider.trim() || !model.trim()) {
      toast.error('请填写完整模型配置')
      return
    }

    updateLlmConfig.mutate({
      path: { config_id: editingId },
      body: {
        name: name.trim(),
        provider: provider.trim(),
        model: model.trim(),
        baseUrl: baseUrl.trim() || null,
      },
    })
  }

  const handleDeleteLlmConfig = (config_id: string) => {
    deleteLlmConfig.mutate({
      path: { config_id },
    })
  }

  const handleToggleLlmActive = (configId: string, isActive: boolean) => {
    updateLlmConfig.mutate({
      path: { config_id: configId },
      body: { isActive: !isActive },
    })
  }

  const startEditing = (item: LlmConfigOut) => {
    setEditingId(item.id)
    setName(item.name)
    setProvider(item.provider)
    setModel(item.model)
    setBaseUrl(item.baseUrl || '')
  }

  const cancelEditing = () => {
    setEditingId('')
  }

  return {
    data: {
      llmConfigs,
    },
    form: {
      name,
      provider,
      model,
      baseUrl,
      setName,
      setProvider,
      setModel,
      setBaseUrl,
    },
    state: {
      editingLlmId: editingId,
      isCreating: createLlmConfig.isPending,
      isUpdating: updateLlmConfig.isPending,
      isDeleting: deleteLlmConfig.isPending,
    },
    actions: {
      create: handleCreateLlmConfig,
      update: handleUpdateLlmConfig,
      delete: handleDeleteLlmConfig,
      toggleActive: handleToggleLlmActive,
      startEditing,
      cancelEditing,
    },
  }
}

export type LlmConfigsState = ReturnType<typeof useLlmConfigs>
