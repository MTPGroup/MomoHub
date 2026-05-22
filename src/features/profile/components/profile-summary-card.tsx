import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import type { ProfileState } from '../hooks/use-profile'
import { getInitialChar } from '../utils'

export function ProfileSummaryCard({
  profile,
}: {
  profile: ProfileState
}) {
  const me = profile.data.me
  const displayName = profile.form.name || me?.name

  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='text-base'>账号概览</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 px-5'>
        <div className='flex items-center gap-4'>
          <Avatar className='size-16'>
            <AvatarImage
              src={profile.form.avatarPreviewUrl || me?.avatar}
              alt={displayName}
            />
            <AvatarFallback className='text-lg'>
              {getInitialChar(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-1 text-sm'>
            <p className='font-medium'>{me?.name || profile.auth.name || '-'}</p>
            <Badge variant='secondary'>{me?.status || profile.auth.status}</Badge>
          </div>
        </div>
        <div className='space-y-1 text-xs text-muted-foreground'>
          <p>用户ID：{me?.id || '-'}</p>
          <p>创建时间：{formatDateTime(me?.createdAt)}</p>
          <p>更新时间：{formatDateTime(me?.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
