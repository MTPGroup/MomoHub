import type {
  CharacterResponse,
  CreateCharacterRequest,
  PagedResponse,
  UpdateCharacterRequest,
} from '@momohub/types'

export const useCharacters = () => {
  const { api } = useAzusaApi()

  const listPublicCharacters = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    return api<PagedResponse<CharacterResponse>>('/characters/public', {
      params,
    })
  }

  const listCharacters = async (params?: {
    page?: number
    limit?: number
    search?: string
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

  return {
    listPublicCharacters,
    listCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  }
}
