import type {
  CreatePluginRequest,
  PagedResponse,
  PluginDetailResponse,
  PluginResponse,
  UpdatePluginRequest,
} from '@momohub/types'

export const usePlugins = () => {
  const { api } = useAzusaApi()

  const listPlugins = async (params?: { page?: number; limit?: number }) => {
    return api<PagedResponse<PluginResponse>>('/plugins', { params })
  }

  const searchPlugins = async (params?: {
    q?: string
    page?: number
    limit?: number
  }) => {
    return api<PagedResponse<PluginResponse>>('/plugins/search', { params })
  }

  const getPlugin = async (id: string) => {
    return api<PluginDetailResponse>(`/plugins/${id}`)
  }

  const createPlugin = async (data: CreatePluginRequest) => {
    return api<PluginResponse>('/plugins', { method: 'POST', body: data })
  }

  const updatePlugin = async (id: string, data: UpdatePluginRequest) => {
    return api<PluginResponse>(`/plugins/${id}`, { method: 'PUT', body: data })
  }

  const deletePlugin = async (id: string) => {
    return api<undefined>(`/plugins/${id}`, { method: 'DELETE' })
  }

  const listMyPlugins = async (params?: { page?: number; limit?: number }) => {
    return api<PagedResponse<PluginResponse>>('/me/plugins', { params })
  }

  const likePlugin = async (id: string) => {
    return api<undefined>(`/plugins/${id}/like`, { method: 'POST' })
  }

  const unlikePlugin = async (id: string) => {
    return api<undefined>(`/plugins/${id}/like`, { method: 'DELETE' })
  }

  const approvePlugin = async (id: string) => {
    return api<PluginResponse>(`/plugins/${id}/approve`, { method: 'POST' })
  }

  const rejectPlugin = async (id: string) => {
    return api<PluginResponse>(`/plugins/${id}/reject`, { method: 'POST' })
  }

  const listPendingPlugins = async () => {
    return api<PagedResponse<PluginResponse>>('/admin/plugins/pending')
  }

  return {
    listPlugins,
    searchPlugins,
    getPlugin,
    createPlugin,
    updatePlugin,
    deletePlugin,
    listMyPlugins,
    likePlugin,
    unlikePlugin,
    approvePlugin,
    rejectPlugin,
    listPendingPlugins,
  }
}
