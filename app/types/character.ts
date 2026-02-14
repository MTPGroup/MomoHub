export interface CharacterResponse {
  id: string
  authorId: string
  name: string
  avatar: string | null
  bio: string | null
  originPrompt: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterRequest {
  name: string
  avatar?: string | null
  bio?: string | null
  originPrompt?: string | null
  isPublic?: boolean
}

export interface UpdateCharacterRequest {
  name: string
  avatar?: string | null
  bio?: string | null
  originPrompt?: string | null
  isPublic?: boolean
}

export interface KnowledgeSubscriptionResponse {
  knowledgeBaseId: unknown
  priority: number
}

export interface SubscribeKnowledgeBaseRequest {
  knowledgeBaseId: string
  priority?: number
}
