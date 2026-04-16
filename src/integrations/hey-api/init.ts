import { client } from '@/client/client.gen'
import { env } from '@/env'

client.setConfig({
  baseUrl: env.VITE_API_BASE_URL || 'http://localhost:8000',
})
