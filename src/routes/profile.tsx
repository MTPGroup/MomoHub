import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Camera, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  getCurrentUserOptions,
  getCurrentUserQueryKey,
  updateCurrentUserMutation,
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

function ProfilePage() {
  const auth = useAuth()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')

  const meQuery = useQuery(
    getCurrentUserOptions(),
  )

  const updateProfile = useMutation({
    ...updateCurrentUserMutation(),
    onSuccess: (res) => {
      const user = res.data
      if (user) {
        setAuth({
          name: user.name,
          avatar: user.avatar,
          status: user.status,
        })
      }
      toast.success('个人资料已更新')
      queryClient.invalidateQueries({ queryKey: getCurrentUserQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const me = meQuery.data?.data

  useEffect(() => {
    if (!me) {
      return
    }

    setName(me.name)
    setAvatar(me.avatar || '')
  }, [me])

  const handleSubmit = () => {
    updateProfile.mutate({
      body: {
        name: name.trim() || null,
        avatar: avatar.trim() || null,
      },
    })
  }

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>个人资料</h1>
        <p className='text-sm leading-6 text-muted-foreground'>
          在这里维护你的公开头像与昵称。提交后，顶部头像下拉会实时同步。
        </p>
      </section>

      <AuthRequired>
        <div className='grid gap-6 md:grid-cols-[320px_1fr]'>
          <Card className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <CardTitle className='text-base'>账号概览</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 px-5'>
              <div className='flex items-center gap-4'>
                <Avatar className='size-16'>
                  <AvatarImage src={avatar || me?.avatar} alt={name || me?.name} />
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

          <Card className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <CardTitle className='text-base'>编辑资料</CardTitle>
              <CardDescription>建议头像使用稳定 URL，方便在多端一致展示。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 px-5'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>昵称</p>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder='请输入昵称'
                />
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>头像 URL</p>
                <Input
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  placeholder='https://example.com/avatar.png'
                />
              </div>
              <Button onClick={handleSubmit} disabled={updateProfile.isPending}>
                <Save className='size-4' />
                {updateProfile.isPending ? '保存中...' : '保存资料'}
              </Button>
              <p className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Camera className='size-3.5' />
                如果头像链接不可访问，将自动显示首字母占位图。
              </p>
            </CardContent>
          </Card>
        </div>
      </AuthRequired>
    </div>
  )
}
