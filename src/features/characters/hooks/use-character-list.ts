import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useDebounceValue } from 'usehooks-ts'
import {
  createCharacterMutation,
  getCharactersOptions,
  getCharactersQueryKey,
  uploadCharacterAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { parseBaseConfigFromText, revokeObjectUrl } from '#/utils/character'

export function useCharacterList({ mineOnly }: { mineOnly: boolean }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createAvatarInputRef = useRef<HTMLInputElement | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const listPath = mineOnly ? '/my/characters' : '/characters'
  const isListPage = pathname === listPath

  const [query, setQuery] = useDebounceValue('', 500)
  const [createName, setCreateName] = useState('')
  const [createBio, setCreateBio] = useState('')
  const [createSystemPrompt, setCreateSystemPrompt] = useState('')
  const [createBaseConfig, setCreateBaseConfig] = useState('')
  const [createTags, setCreateTags] = useState<string[]>([])
  const [createPublic, setCreatePublic] = useState(true)
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null)
  const [createAvatarPreviewUrl, setCreateAvatarPreviewUrl] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const clearCreateAvatarSelection = () => {
    setCreateAvatarFile(null)
    setCreateAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return ''
    })
    if (createAvatarInputRef.current) {
      createAvatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(createAvatarPreviewUrl)
    }
  }, [createAvatarPreviewUrl])

  const characterQuery = useQuery({
    ...getCharactersOptions({
      query: {
        page: 1,
        page_size: 30,
        keyword: query.trim() || undefined,
        mine: mineOnly,
      },
    }),
    enabled: isListPage,
  })

  const uploadCharacterAvatar = useMutation({
    ...uploadCharacterAvatarMutation(),
  })

  const createCharacter = useMutation({
    ...createCharacterMutation(),
    onSuccess: async (res) => {
      const newCharacterId = res.data?.id
      if (newCharacterId && createAvatarFile) {
        try {
          await uploadCharacterAvatar.mutateAsync({
            path: { id: newCharacterId },
            body: { file: createAvatarFile },
          })
          toast.success('角色头像已上传')
        } catch (error) {
          toast.warning('角色已创建，但头像上传失败', {
            description:
              error instanceof Error
                ? error.message
                : '请稍后在角色管理页重试上传头像',
          })
        }
      }

      toast.success('角色已创建')
      setCreateName('')
      setCreateBio('')
      setCreateSystemPrompt('')
      setCreateBaseConfig('')
      setCreateTags([])
      setCreatePublic(true)
      clearCreateAvatarSelection()
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      if (newCharacterId) {
        void navigate({ to: '/characters/$id', params: { id: newCharacterId } })
      }
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const characters = characterQuery.data?.data?.items ?? []

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    const baseConfig = parseBaseConfigFromText(createBaseConfig)
    if (baseConfig === null) {
      toast.error('baseConfig 必须是合法 JSON 对象')
      return
    }

    createCharacter.mutate({
      body: {
        name: createName.trim(),
        bio: createBio.trim() || null,
        systemPrompt: createSystemPrompt.trim() || undefined,
        baseConfig,
        tags: createTags,
        isPublic: createPublic,
        status: 'active',
      },
    })
  }

  const openDetail = (id: string) => {
    void navigate({ to: '/characters/$id', params: { id } })
  }

  const handleCreateAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      event.target.value = ''
      return
    }

    setCreateAvatarFile(file)
    setCreateAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  return {
    data: {
      characters,
    },
    form: {
      createName,
      createBio,
      createSystemPrompt,
      createBaseConfig,
      createTags,
      createPublic,
      createAvatarFile,
      createAvatarPreviewUrl,
      setCreateName,
      setCreateBio,
      setCreateSystemPrompt,
      setCreateBaseConfig,
      setCreateTags,
      setCreatePublic,
    },
    state: {
      isListPage,
      query,
      createDialogOpen,
      isCreating: createCharacter.isPending,
    },
    refs: {
      createAvatarInputRef,
    },
    actions: {
      setQuery,
      setCreateDialogOpen,
      clearCreateAvatarSelection,
      changeCreateAvatar: handleCreateAvatarChange,
      create: handleCreate,
      openDetail,
    },
  }
}

export type CharacterListState = ReturnType<typeof useCharacterList>
