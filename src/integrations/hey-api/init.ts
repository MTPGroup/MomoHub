import { client } from '#/client/client.gen'
import { siteConfig } from '#/env'
import { authStore, restoreAuthSession } from '#/stores/auth'

client.setConfig({
  baseUrl: siteConfig.links.api,
  credentials: 'include',
  auth: () => authStore.state.accessToken,
})

if (typeof window !== 'undefined') {
  void restoreAuthSession()
}
