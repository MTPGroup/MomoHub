import type {
  PluginResponse,
  PluginDetailResponse,
  PagedResponse
} from '@momohub/types'

export const usePlugins = () => {
  const { api } = useAzusaApi()

  const listPlugins = async (params?: { page?: number, limit?: number }) => {
    return api<PagedResponse<PluginResponse>>('/plugins', { params })
  }

  const getPlugin = async (id: string) => {
    return api<PluginDetailResponse>(`/plugins/${id}`)
  }

  return {
    listPlugins,
    getPlugin
  }
}
