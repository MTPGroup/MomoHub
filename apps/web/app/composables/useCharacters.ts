import type {
  CharacterResponse,
  CreateCharacterRequest,
  KnowledgeSubscriptionResponse,
  PagedResponse,
  SubscribeKnowledgeBaseRequest,
  UpdateCharacterRequest,
} from '@momohub/types'

export const useCharacters = () => {
  const { api } = useAzusaApi()
  const config = useRuntimeConfig()
  const accessToken = useCookie('auth_access_token')

  const listPublicCharacters = async (params?: {
    page?: number
    limit?: number
  }) => {
    return api<PagedResponse<CharacterResponse>>('/characters/public', {
      params,
    })
  }

  const searchCharacters = async (params?: {
    q?: string
    page?: number
    limit?: number
  }) => {
    return api<PagedResponse<CharacterResponse>>('/characters/search', {
      params,
    })
  }

  const listCharacters = async (params?: {
    page?: number
    limit?: number
  }) => {
    return api<PagedResponse<CharacterResponse>>('/characters', { params })
  }

  const getCharacter = async (id: string) => {
    return api<CharacterResponse>(`/characters/${id}`)
  }

  const createCharacter = async (data: CreateCharacterRequest) => {
    return api<CharacterResponse>('/characters', {
      method: 'POST',
      body: data,
    })
  }

  const updateCharacter = async (id: string, data: UpdateCharacterRequest) => {
    return api<CharacterResponse>(`/characters/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteCharacter = async (id: string) => {
    return api<undefined>(`/characters/${id}`, {
      method: 'DELETE',
    })
  }

  const uploadCharacterAvatar = async (characterId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return $fetch<CharacterResponse>(
      `${config.public.apiBaseUrl}/characters/${characterId}/avatar`,
      {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      },
    )
  }

  const listCharacterKnowledgeBases = async (characterId: string) => {
    return api<KnowledgeSubscriptionResponse[]>(
      `/characters/${characterId}/knowledge-bases`,
    )
  }

  const subscribeKnowledgeBase = async (
    characterId: string,
    data: SubscribeKnowledgeBaseRequest,
  ) => {
    return api<undefined>(`/characters/${characterId}/knowledge-bases`, {
      method: 'POST',
      body: data,
    })
  }

  const unsubscribeKnowledgeBase = async (
    characterId: string,
    knowledgeBaseId: string,
  ) => {
    return api<undefined>(
      `/characters/${characterId}/knowledge-bases/${knowledgeBaseId}`,
      { method: 'DELETE' },
    )
  }

  return {
    listPublicCharacters,
    searchCharacters,
    listCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    uploadCharacterAvatar,
    listCharacterKnowledgeBases,
    subscribeKnowledgeBase,
    unsubscribeKnowledgeBase,
  }
}
