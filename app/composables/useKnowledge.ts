import type {
  CreateKnowledgeBaseRequest,
  KnowledgeBaseResponse,
  KnowledgeBaseStatsResponse,
  KnowledgeFileResponse,
  PagedResponse,
  UpdateKnowledgeBaseRequest
} from '~/types'

export const useKnowledge = () => {
  const { api } = useAzusaApi()
  const config = useRuntimeConfig()
  const accessToken = useCookie('auth_access_token')

  const listPublicKnowledgeBases = async (params?: { page?: number, limit?: number }) => {
    return api<PagedResponse<KnowledgeBaseResponse>>('/knowledge-bases/public', { params })
  }

  const listKnowledgeBases = async (params?: { page?: number, limit?: number }) => {
    return api<PagedResponse<KnowledgeBaseResponse>>('/knowledge-bases', { params })
  }

  const getKnowledgeBase = async (id: string) => {
    return api<KnowledgeBaseResponse>(`/knowledge-bases/${id}`)
  }

  const createKnowledgeBase = async (data: CreateKnowledgeBaseRequest) => {
    return api<KnowledgeBaseResponse>('/knowledge-bases', {
      method: 'POST',
      body: data
    })
  }

  const updateKnowledgeBase = async (id: string, data: UpdateKnowledgeBaseRequest) => {
    return api<KnowledgeBaseResponse>(`/knowledge-bases/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  const deleteKnowledgeBase = async (id: string) => {
    return api<undefined>(`/knowledge-bases/${id}`, {
      method: 'DELETE'
    })
  }

  const getKnowledgeBaseStats = async (id: string) => {
    return api<KnowledgeBaseStatsResponse>(`/knowledge-bases/${id}/stats`)
  }

  const listFiles = async (knowledgeBaseId: string) => {
    return api<KnowledgeFileResponse[]>(`/knowledge-bases/${knowledgeBaseId}/files`)
  }

  const uploadFile = async (knowledgeBaseId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return $fetch<KnowledgeFileResponse>(`${config.public.apiBaseUrl}/knowledge-bases/${knowledgeBaseId}/files`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })
  }

  const deleteFile = async (knowledgeBaseId: string, fileId: string) => {
    return api<undefined>(`/knowledge-bases/${knowledgeBaseId}/files/${fileId}`, {
      method: 'DELETE'
    })
  }

  return {
    listPublicKnowledgeBases,
    listKnowledgeBases,
    getKnowledgeBase,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    getKnowledgeBaseStats,
    listFiles,
    uploadFile,
    deleteFile
  }
}
