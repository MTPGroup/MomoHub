import { Camera, Save } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import type { ProfileState } from '../hooks/use-profile'
import { getInitialChar } from '../utils'

export function ProfileEditCard({
  profile,
}: {
  profile: ProfileState
}) {
  const me = profile.data.me
  const displayName = profile.form.name || me?.name

  return (
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
            onClick={() => profile.refs.avatarInputRef.current?.click()}
            aria-label='选择用户头像'
          >
            <Avatar className='size-16 border border-border/80'>
              <AvatarImage
                src={profile.form.avatarPreviewUrl || me?.avatar}
                alt='用户头像预览'
              />
              <AvatarFallback className='text-base'>
                {getInitialChar(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
              <Camera className='size-4 text-background' />
            </div>
          </button>
          <div className='min-w-0 flex-1 space-y-1'>
            <p className='text-sm font-medium'>头像</p>
            <p className='truncate text-xs text-muted-foreground'>
              {profile.form.avatarFile
                ? profile.form.avatarFile.name
                : '点击头像选择本地图片'}
            </p>
          </div>
          {profile.form.avatarFile && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={profile.actions.clearAvatarSelection}
            >
              清除
            </Button>
          )}
          <input
            ref={profile.refs.avatarInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={profile.actions.changeAvatar}
          />
        </div>
        <div className='space-y-2'>
          <p className='text-sm font-medium'>昵称</p>
          <Input
            value={profile.form.name}
            onChange={(event) => profile.form.setName(event.target.value)}
            placeholder='请输入昵称'
          />
        </div>
        <Button onClick={profile.actions.submit} disabled={profile.state.isSaving}>
          <Save className='size-4' />
          {profile.state.isSaving ? '保存中...' : '保存资料'}
        </Button>
      </CardContent>
    </Card>
  )
}
