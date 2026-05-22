import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  cancelFavoriteCharacterMutation,
  deleteCharacterMutation,
  favoriteCharacterMutation,
  getCharactersQueryKey,
  getPublicCharacterOptions,
  getPublicCharacterQueryKey,
  updateCharacterMutation,
  uploadCharacterAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import type { ApiResponseCharacterDetailOut } from '#/client/types.gen'
import { parseBaseConfigFromText, revokeObjectUrl } from '#/utils/character'

export function useCharacterDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isDetailPage = pathname === `/characters/${id}`

  const [editingOpen, setEditingOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSystemPrompt, setEditSystemPrompt] = useState('')
  const [editBaseConfig, setEditBaseConfig] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editPublic, setEditPublic] = useState(true)
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreviewUrl, setEditAvatarPreviewUrl] = useState('')
  const [knowledgeBindingDialogOpen, setKnowledgeBindingDialogOpen] =
    useState(false)

  const clearEditAvatarSelection = (nextPreview = '') => {
    setEditAvatarFile(null)
    setEditAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return nextPreview
    })
    if (editAvatarInputRef.current) {
      editAvatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(editAvatarPreviewUrl)
    }
  }, [editAvatarPreviewUrl])

  const characterQuery = useQuery({
    ...getPublicCharacterOptions({
      path: { id },
    }),
  })

  const character = characterQuery.data?.data

  const uploadCharacterAvatar = useMutation({
    ...uploadCharacterAvatarMutation(),
  })

  const updateCharacter = useMutation({
    ...updateCharacterMutation(),
    onSuccess: async () => {
      if (editAvatarFile) {
        try {
          await uploadCharacterAvatar.mutateAsync({
            path: { id },
            body: { file: editAvatarFile },
          })
          toast.success('角色头像已上传')
        } catch (error) {
          toast.warning('角色资料已保存，但头像上传失败', {
            description:
              error instanceof Error ? error.message : '请稍后重试上传头像',
          })
        }
      }
      toast.success('角色已更新')
      setEditingOpen(false)
      clearEditAvatarSelection()
      queryClient.invalidateQueries({
        queryKey: getPublicCharacterQueryKey({
          path: { id },
        }),
      })
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteCharacter = useMutation({
    ...deleteCharacterMutation(),
    onSuccess: async () => {
      toast.success('角色已删除')
      await queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      void navigate({ to: '/characters' })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const favoriteCharacter = useMutation({
    ...favoriteCharacterMutation(),
    onSuccess: () => {
      toast.success('收藏成功')
      queryClient.setQueryData(
        getPublicCharacterQueryKey({
          path: { id },
        }),
        (previous: ApiResponseCharacterDetailOut | undefined) => {
          const detail = previous?.data
          if (!detail) return previous
          return {
            ...previous,
            data: {
              ...detail,
              isFavorited: true,
              favoriteCount: (detail.favoriteCount ?? 0) + 1,
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('收藏失败', { description: error.message || '请稍后重试' })
    },
  })

  const cancelFavorite = useMutation({
    ...cancelFavoriteCharacterMutation(),
    onSuccess: () => {
      toast.success('已取消收藏')
      queryClient.setQueryData(
        getPublicCharacterQueryKey({
          path: { id },
        }),
        (previous: ApiResponseCharacterDetailOut | undefined) => {
          const detail = previous?.data
          if (!detail) return previous
          return {
            ...previous,
            data: {
              ...detail,
              isFavorited: false,
              favoriteCount: Math.max((detail.favoriteCount ?? 1) - 1, 0),
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('取消收藏失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const openEditDialog = () => {
    if (!character) {
      return
    }
    setEditName(character.name)
    setEditBio(character.bio || '')
    setEditSystemPrompt(character.systemPrompt || '')
    setEditBaseConfig(
      character.baseConfig ? JSON.stringify(character.baseConfig, null, 2) : '',
    )
    setEditTags(character.tags ?? [])
    setEditPublic(Boolean(character.isPublic))
    clearEditAvatarSelection(character.avatar || '')
    setEditingOpen(true)
  }

  const handleUpdate = () => {
    if (!editName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    const baseConfig = parseBaseConfigFromText(editBaseConfig)
    if (baseConfig === null) {
      toast.error('baseConfig 必须是合法 JSON 对象')
      return
    }

    updateCharacter.mutate({
      path: { id },
      body: {
        name: editName.trim(),
        bio: editBio.trim() || '',
        systemPrompt: editSystemPrompt.trim() || '',
        baseConfig: baseConfig ?? null,
        tags: editTags,
        isPublic: editPublic,
      },
    })
  }

  const handleEditAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      event.target.value = ''
      return
    }
    setEditAvatarFile(file)
    setEditAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  const openDetailTest = (characterId: string) => {
    void navigate({
      to: '/characters/$id/detail-test',
      params: { id: characterId },
    })
  }

  const toggleFavorite = () => {
    if (!character) {
      return
    }
    if (character.isFavorited) {
      cancelFavorite.mutate({
        path: { id: character.id },
      })
      return
    }
    favoriteCharacter.mutate({
      path: { id: character.id },
    })
  }

  const remove = (characterId: string) => {
    deleteCharacter.mutate({
      path: { id: characterId },
    })
  }

  return {
    data: {
      character,
    },
    form: {
      editName,
      editBio,
      editSystemPrompt,
      editBaseConfig,
      editTags,
      editPublic,
      editAvatarFile,
      editAvatarPreviewUrl,
      setEditName,
      setEditBio,
      setEditSystemPrompt,
      setEditBaseConfig,
      setEditTags,
      setEditPublic,
    },
    state: {
      isDetailPage,
      isLoading: characterQuery.isPending,
      editingOpen,
      knowledgeBindingDialogOpen,
      isUpdating: updateCharacter.isPending,
      isDeleting: deleteCharacter.isPending,
      isFavoritePending: favoriteCharacter.isPending || cancelFavorite.isPending,
    },
    refs: {
      editAvatarInputRef,
    },
    actions: {
      setEditingOpen,
      setKnowledgeBindingDialogOpen,
      clearEditAvatarSelection,
      changeEditAvatar: handleEditAvatarChange,
      openEditDialog,
      update: handleUpdate,
      openDetailTest,
      toggleFavorite,
      delete: remove,
    },
  }
}

export type CharacterDetailState = ReturnType<typeof useCharacterDetail>
