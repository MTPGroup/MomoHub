import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteKbMutation,
  getKbOptions,
  getKbQueryKey,
  listDocumentsQueryKey,
  listKbsQueryKey,
  updateKbMutation,
  uploadKbAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { revokeObjectUrl } from '../utils'

export function useKnowledgeBaseDetail({
  kbId,
  enabled,
  onDeleteKnowledgeBase,
}: {
  kbId: string
  enabled: boolean
  onDeleteKnowledgeBase: () => void
}) {
  const queryClient = useQueryClient()

  const editAvatarInputRef = useRef<HTMLInputElement | null>(null)
  const [editingOpen, setEditingOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPublic, setEditPublic] = useState(false)
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreviewUrl, setEditAvatarPreviewUrl] = useState('')

  const kbQuery = useQuery({
    ...getKbOptions({
      path: { id: kbId },
    }),
    enabled,
  })

  const kb = kbQuery.data?.data

  const refreshQueue = () => {
    queryClient.invalidateQueries({
      queryKey: listDocumentsQueryKey({ path: { id: kbId } }),
    })
  }

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

  const handleEditAvatarChange = (
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
    setEditAvatarFile(file)
    setEditAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  const uploadKbAvatar = useMutation({
    ...uploadKbAvatarMutation(),
  })

  const updateKb = useMutation({
    ...updateKbMutation(),
    onSuccess: async () => {
      if (editAvatarFile) {
        try {
          await uploadKbAvatar.mutateAsync({
            path: { id: kbId },
            body: { file: editAvatarFile },
          })
          toast.success('知识库头像已上传')
        } catch (error) {
          toast.warning('知识库信息已保存，但头像上传失败', {
            description:
              error instanceof Error ? error.message : '请稍后重试上传头像',
          })
        }
      }
      toast.success('知识库已更新')
      setEditingOpen(false)
      clearEditAvatarSelection()
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id: kbId } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const handleUpdate = () => {
    if (!editName.trim()) {
      toast.error('请输入知识库名称')
      return
    }

    updateKb.mutate({
      path: { id: kbId },
      body: {
        name: editName.trim(),
        description: editDescription.trim() || null,
        isPublic: editPublic,
      },
    })
  }

  const deleteKb = useMutation({
    ...deleteKbMutation(),
    onSuccess: async () => {
      toast.success('知识库已删除')
      await queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
      onDeleteKnowledgeBase()
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const handleDelete = () => {
    deleteKb.mutate({
      path: { id: kbId },
    })
  }

  const openEditDialog = () => {
    if (!kb) {
      return
    }
    setEditName(kb.name)
    setEditDescription(kb.description || '')
    setEditPublic(Boolean(kb.isPublic))
    clearEditAvatarSelection(kb.avatar || '')
    setEditingOpen(true)
  }

  const closeEditDialog = () => {
    if (!kb) {
      return
    }
    setEditName(kb.name)
    setEditDescription(kb.description || '')
    setEditPublic(Boolean(kb.isPublic))
    clearEditAvatarSelection(kb.avatar || '')
    setEditingOpen(false)
  }

  return {
    data: {
      kb,
    },
    form: {
      editName,
      editDescription,
      editPublic,
      editAvatarFile,
      editAvatarPreviewUrl,
      setEditName,
      setEditDescription,
      setEditPublic,
      setEditAvatarFile,
      setEditAvatarPreviewUrl,
    },
    state: {
      isEditDialogOpen: editingOpen,
      isLoading: kbQuery.isPending,
      isUpdating: updateKb.isPending,
      isDeleting: deleteKb.isPending,
    },
    refs: {
      editAvatarInputRef,
    },
    actions: {
      refreshQueue,
      update: handleUpdate,
      delete: handleDelete,
      openDialog: openEditDialog,
      closeDialog: closeEditDialog,
      clearEditAvatarSelection,
      changeAvatar: handleEditAvatarChange,
    },
  }
}

export type KnowledgeBaseDetailState = ReturnType<typeof useKnowledgeBaseDetail>
