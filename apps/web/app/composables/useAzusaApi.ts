import type { ApiResponse } from '@momohub/types'

type FetchOptionsType = Parameters<typeof $fetch>[1]

export const useAzusaApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const fetchApi = $fetch.create({
    baseURL: config.public.apiBaseUrl as string,
    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    },
    async onResponseError({ request, options, response }) {
      if (response.status === 401 && authStore.accessToken) {
        // 尝试用 refreshToken 刷新
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed) {
          // 刷新成功，用新 token 重试原请求
          options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
          return $fetch(request, options as FetchOptionsType)
        }
        // 刷新失败，清除过期 token 后无认证重试（公开接口不需要权限）
        authStore.logout()
        options.headers.delete('Authorization')
        return $fetch(request, options as FetchOptionsType)
      }
    }
  })

  const api = async <T>(url: string, options?: Parameters<typeof fetchApi>[1]) => {
    return fetchApi<ApiResponse<T>>(url, options)
  }

  return { fetchApi, api }
}
