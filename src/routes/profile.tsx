import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Camera, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getCurrentUserOptions,
  getCurrentUserQueryKey,
  updateCurrentUserMutation,
  uploadCurrentUserAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { AuthRequired } from '#/components/shared/auth-required'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { formatDateTime } from '#/lib/format'
import { setAuth, useAuth } from '#/stores/auth'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function ProfilePage() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')

  const meQuery = useQuery(getCurrentUserOptions())

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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          name: latestUser.name,
          avatar: latestUser.avatar,
          status: latestUser.status,
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

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          个人资料
        </h1>
        <p className='text-sm leading-6 text-muted-foreground'>
          在这里维护你的公开头像与昵称。
        </p>
      </section>

      <AuthRequired>
        <div className='grid gap-6 md:grid-cols-[320px_1fr]'>
          <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
            <CardHeader className='px-5'>
              <CardTitle className='text-base'>账号概览</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 px-5'>
              <div className='flex items-center gap-4'>
                <Avatar className='size-16'>
                  <AvatarImage
                    src={avatarPreviewUrl || me?.avatar}
                    alt={name || me?.name}
                  />
                  <AvatarFallback className='text-lg'>
                    {(name || me?.name || 'U').slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-1 text-sm'>
                  <p className='font-medium'>{me?.name || auth.name || '-'}</p>
                  <Badge variant='secondary'>{me?.status || auth.status}</Badge>
                </div>
              </div>
              <div className='space-y-1 text-xs text-muted-foreground'>
                <p>用户ID：{me?.id || '-'}</p>
                <p>创建时间：{formatDateTime(me?.createdAt)}</p>
                <p>更新时间：{formatDateTime(me?.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
            <CardHeader className='px-5'>
              <CardTitle className='text-base'>编辑资料</CardTitle>
              <CardDescription>修改昵称，或上传新头像。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 px-5'>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  className='group relative'
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label='选择用户头像'
                >
                  <Avatar className='size-16 border border-border/80'>
                    <AvatarImage
                      src={avatarPreviewUrl || me?.avatar}
                      alt='用户头像预览'
                    />
                    <AvatarFallback className='text-base'>
                      {(name || me?.name || 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Camera className='size-4 text-background' />
                  </div>
                </button>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-sm font-medium'>头像</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {avatarFile ? avatarFile.name : '点击头像选择本地图片'}
                  </p>
                </div>
                {avatarFile && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={clearAvatarSelection}
                  >
                    清除
                  </Button>
                )}
                <input
                  ref={avatarInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleAvatarChange}
                />
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>昵称</p>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder='请输入昵称'
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={
                  updateProfile.isPending || uploadCurrentUserAvatar.isPending
                }
              >
                <Save className='size-4' />
                {updateProfile.isPending || uploadCurrentUserAvatar.isPending
                  ? '保存中...'
                  : '保存资料'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthRequired>
    </div>
  )
}
