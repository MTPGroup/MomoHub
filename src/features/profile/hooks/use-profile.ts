import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  getCurrentUserOptions,
  getCurrentUserQueryKey,
  updateCurrentUserMutation,
  uploadCurrentUserAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { useAuth } from '#/hooks/use-auth'
import { setAuth } from '#/stores/auth'
import { revokeObjectUrl } from '../utils'

export function useProfile() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')

  const meQuery = useQuery({
    ...getCurrentUserOptions(),
    enabled: auth.isLoggedIn,
  })

  const updateProfile = useMutation({
    ...updateCurrentUserMutation(),
  })
  const uploadCurrentUserAvatar = useMutation({
    ...uploadCurrentUserAvatarMutation(),
  })

  const me = meQuery.data?.data

  useEffect(() => {
    if (!me) {
      return
    }

    setName(me.name)
  }, [me])

  useEffect(() => {
    return () => {
      revokeObjectUrl(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  const clearAvatarSelection = () => {
    setAvatarFile(null)
    setAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return ''
    })
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      event.target.value = ''
      return
    }
    setAvatarFile(file)
    setAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('昵称不能为空')
      return
    }

    try {
      let latestUser = me
      const updated = await updateProfile.mutateAsync({
        body: {
          name: trimmedName,
        },
      })
      latestUser = updated.data ?? latestUser

      if (avatarFile) {
        const avatarUpdated = await uploadCurrentUserAvatar.mutateAsync({
          body: { file: avatarFile },
        })
        latestUser = avatarUpdated.data ?? latestUser
      }

      if (latestUser) {
        setAuth({
          user: {
            name: latestUser.name,
            avatar: latestUser.avatar,
            status: latestUser.status,
          },
        })
      }
      clearAvatarSelection()
      toast.success('个人资料已更新')
      queryClient.invalidateQueries({ queryKey: getCurrentUserQueryKey() })
    } catch (error) {
      toast.error('更新失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }

  return {
    auth,
    data: {
      me,
    },
    form: {
      name,
      avatarFile,
      avatarPreviewUrl,
      setName,
    },
    state: {
      isSaving: updateProfile.isPending || uploadCurrentUserAvatar.isPending,
    },
    refs: {
      avatarInputRef,
    },
    actions: {
      clearAvatarSelection,
      changeAvatar: handleAvatarChange,
      submit: handleSubmit,
    },
  }
}

export type ProfileState = ReturnType<typeof useProfile>
