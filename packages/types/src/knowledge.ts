export interface KnowledgeBaseResponse {
  id: string
  name: string
  description: string | null
  authorId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface PagedKnowledgeBaseResponse {
  items: KnowledgeBaseResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string | null
  isPublic?: boolean
}

export interface UpdateKnowledgeBaseRequest {
  name: string
  description?: string | null
  isPublic: boolean
}

export interface KnowledgeBaseStatsResponse {
  knowledgeBaseId: string
  fileCount: number
  documentCount: number
}

export type KnowledgeFileStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'

export interface KnowledgeFileResponse {
  id: string
  knowledgeBaseId: string
  fileName: string
  fileSize: number | null
  fileType: string | null
  status: KnowledgeFileStatus
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface SearchKnowledgeRequest {
  query: string
  knowledgeBaseIds?: string[] | null
  threshold?: number
  limit?: number
}

export interface SearchResultResponse {
  documentId: string
  knowledgeBaseId: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}
