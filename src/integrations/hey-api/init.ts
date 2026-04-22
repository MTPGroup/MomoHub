import { client } from '#/client/client.gen'
import { siteConfig } from '#/env'

client.setConfig({
  baseUrl: siteConfig.links.api,
  credentials: 'include',
})
