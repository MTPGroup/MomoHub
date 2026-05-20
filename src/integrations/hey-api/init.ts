import { client } from '#/client/client.gen'
import { siteConfig } from '#/env'
import { clearAuth, refreshToken } from '#/stores/auth'

client.setConfig({
  baseUrl: siteConfig.links.api,
  credentials: 'include',
})

client.interceptors.request.use((request) => {
  request.headers.append('X-Client-Type', 'Web')
  return request
})

client.interceptors.response.use(async (response, request, options) => {
  if (response.status === 401) {
    const isRefreshRequest = request.url.includes('/refresh')
    const currentHeaders = new Headers(options.headers as HeadersInit)
    const isRetry = currentHeaders.get('X-Retry') === 'true'
    if (isRefreshRequest || isRetry) {
      if (isRefreshRequest) {
        clearAuth()
      }
      return response
    }

    try {
      const success = await refreshToken()

      if (success && options.method) {
        console.log(`401 自动刷新成功，重试请求: ${request.url}`)

        const retryHeaders = new Headers(options.headers as HeadersInit)
        retryHeaders.set('X-Retry', 'true')

        const result = await client.request({
          ...options,
          method: options.method,
          headers: retryHeaders,
        })

        return result.response
      }
    } catch (err) {
      console.error('无感刷新失败', err)
    }

    clearAuth()
  }

  return response
})
