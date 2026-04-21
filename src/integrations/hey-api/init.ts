import { client } from '#/client/client.gen'
import { siteConfig } from '#/env'
import { getValidAccessToken, restoreAuthSession } from '#/stores/auth'

client.setConfig({
  baseUrl: siteConfig.links.api,
  credentials: 'include',
  auth: async () => getValidAccessToken(),
})

if (typeof window !== 'undefined') {
  void restoreAuthSession()
}
