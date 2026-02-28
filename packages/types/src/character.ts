export interface AuthorProfileResponse {
  id: string
  name: string
  avatar: string | null
}

export interface CharacterResponse {
  id: string
  author: AuthorProfileResponse | null
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
  knowledgeBaseId: string
  priority: number
}

export interface SubscribeKnowledgeBaseRequest {
  knowledgeBaseId: string
  priority?: number
}
