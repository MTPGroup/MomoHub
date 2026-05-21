import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createKbMutation,
  listKbsOptions,
  listKbsQueryKey,
  uploadKbAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { revokeObjectUrl } from '../utils'

export function useKnowledgeBaseList({ mineOnly }: { mineOnly: boolean }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const listPath = mineOnly ? '/my/knowledge-bases' : '/knowledge-bases'
  const isListPage = pathname === listPath

  const [searchValue, setSearchValue] = useState('')
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPublic, setCreatePublic] = useState(false)
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null)
  const [createAvatarPreviewUrl, setCreateAvatarPreviewUrl] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const clearCreateAvatarSelection = () => {
    setCreateAvatarFile(null)
    setCreateAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return ''
    })
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(createAvatarPreviewUrl)
    }
  }, [createAvatarPreviewUrl])

  const kbQuery = useQuery({
    ...listKbsOptions({
      query: {
        page: 1,
        page_size: 30,
        keyword: searchValue.trim() || undefined,
        mine: mineOnly,
      },
    }),
    enabled: isListPage,
  })

  const uploadKbAvatar = useMutation({
    ...uploadKbAvatarMutation(),
  })

  const createKb = useMutation({
    ...createKbMutation(),
    onSuccess: async (res) => {
      const newKbId = res.data?.id
      if (newKbId && createAvatarFile) {
        try {
          await uploadKbAvatar.mutateAsync({
            path: { id: newKbId },
            body: { file: createAvatarFile },
          })
          toast.success('知识库头像已上传')
        } catch (error) {
          toast.warning('知识库已创建，但头像上传失败', {
            description:
              error instanceof Error
                ? error.message
                : '请稍后在管理页重试上传头像',
          })
        }
      }

      toast.success('知识库已创建')
      setCreateName('')
      setCreateDescription('')
      setCreatePublic(false)
      clearCreateAvatarSelection()
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
      if (newKbId) {
        void navigate({ to: '/knowledge-bases/$id', params: { id: newKbId } })
      }
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const items = kbQuery.data?.data?.items ?? []
  const privateCount = items.filter((item) => !item.isPublic).length

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error('请输入知识库名称')
      return
    }

    createKb.mutate({
      body: {
        name: createName.trim(),
        description: createDescription.trim() || null,
        isPublic: createPublic,
      },
    })
  }

  const openKbDetail = (id: string) => {
    void navigate({ to: '/knowledge-bases/$id', params: { id } })
  }

  const handleCreateAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      items,
      privateCount,
    },
    form: {
      createName,
      createDescription,
      createPublic,
      createAvatarFile,
      createAvatarPreviewUrl,
      setCreateName,
      setCreateDescription,
      setCreatePublic,
    },
    state: {
      isListPage,
      searchValue,
      createDialogOpen,
      isCreating: createKb.isPending,
    },
    refs: {
      avatarInputRef,
    },
    actions: {
      setSearchValue,
      setCreateDialogOpen,
      clearCreateAvatarSelection,
      create: handleCreate,
      changeCreateAvatar: handleCreateAvatarChange,
      openDetail: openKbDetail,
    },
  }
}

export type KnowledgeBaseListState = ReturnType<typeof useKnowledgeBaseList>
