export interface CreateChatRequest {
  characterId: string
  name?: string | null
}

export interface ChatResponse {
  id: string
  name: string | null
  lastMessage: string | null
  characterId: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateChatNameRequest {
  name?: string | null
}

export interface MessageContentDto {
  type: string
  content?: string | null
  url?: string | null
  alt?: string | null
  fileName?: string | null
  fileSize?: number | null
  language?: string | null
  mimeType?: string | null
}

export interface SendMessageRequest {
  content: MessageContentDto[]
}

export interface MessageResponse {
  id: string
  senderType: string
  content: unknown
  createdAt: string
}

export interface ChatConfigResponse {
  temperature: number | null
  maxTokens: number | null
  topP: number | null
  systemPrompt: string | null
}

export interface UpdateChatConfigRequest {
  temperature?: number | null
  maxTokens?: number | null
  topP?: number | null
  systemPrompt?: string | null
}

export interface PluginSubscriptionResponse {
  id: string
  pluginId: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface TogglePluginRequest {
  enabled: boolean
}

export interface UpdatePluginConfigRequest {
  config: Record<string, unknown>
}
