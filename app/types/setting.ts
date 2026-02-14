export type Theme = 'SYSTEM' | 'LIGHT' | 'DARK'

export type LLMProvider
  = | 'OPENAI'
    | 'ALIBABA'
    | 'DEEPSEEK'
    | 'GOOGLE'
    | 'ANTHROPIC'
    | 'OFFICIAL'

export interface LLMConfigResponse {
  id: unknown
  provider: LLMProvider
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number | null
  runOnClient: boolean
}

export interface LLMConfigRequest {
  id: string | null
  provider: LLMProvider
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number | null
  runOnClient?: boolean
}

export interface SettingResponse {
  uid: string
  theme: Theme
  llmConfigs: LLMConfigResponse[]
  activeThemeId: string | null
  activeLlmConfigId: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingRequest {
  theme: Theme
  llmConfigs: LLMConfigRequest[]
  activeThemeId: string | null
  activeLlmConfigId: string | null
}
