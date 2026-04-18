import { client } from '#/client/client.gen'
import { siteConfig } from '#/env'
import { authStore } from '#/stores/auth'

client.setConfig({
  baseUrl: siteConfig.links.api,
  auth: () => authStore.state.accessToken,
})
