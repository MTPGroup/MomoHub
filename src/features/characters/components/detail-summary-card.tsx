import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import { getInitialChar } from '#/utils/character'

type CharacterDetailSummary = {
  name: string
  bio?: string | null
  avatar?: string | null
  isPublic?: boolean | null
  authorName?: string | null
  authorId: string
  authorAvatar?: string | null
  favoriteCount?: number | null
  chatCount?: number | null
  status?: string | null
  createdAt: string
  updatedAt: string
  tags?: string[] | null
}

type CharacterDetailSummaryCardProps = {
  character: CharacterDetailSummary
}

export function CharacterDetailSummaryCard({
  character,
}: CharacterDetailSummaryCardProps) {
  return (
    <Card className='gap-4 border bg-card py-5'>
      <CardHeader className='px-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <Avatar className='mt-0.5 size-12 border border-border'>
              <AvatarImage src={character.avatar || ''} alt={character.name} />
              <AvatarFallback className='text-base'>
                {getInitialChar(character.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-base'>{character.name}</CardTitle>
              <CardDescription>
                {character.bio || '暂无角色简介'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={character.isPublic ? 'secondary' : 'outline'}>
            {character.isPublic ? '公开' : '私有'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4 px-5'>
        <div className='flex items-center gap-2'>
          <Avatar className='size-6'>
            <AvatarImage
              src={character.authorAvatar || ''}
              alt={character.authorName || character.authorId}
            />
            <AvatarFallback className='text-xs'>
              {getInitialChar(character.authorName || character.authorId)}
            </AvatarFallback>
          </Avatar>
          <p className='text-xs text-muted-foreground'>
            {character.authorName || character.authorId}
          </p>
        </div>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='rounded-lg border bg-muted/20 p-3'>
            <p className='text-xs text-muted-foreground'>收藏总数</p>
            <p className='mt-1 text-2xl font-semibold'>
              {character.favoriteCount ?? 0}
            </p>
          </div>
          <div className='rounded-lg border bg-muted/20 p-3'>
            <p className='text-xs text-muted-foreground'>对话总数</p>
            <p className='mt-1 text-2xl font-semibold'>
              {character.chatCount ?? 0}
            </p>
          </div>
          <div className='rounded-lg border bg-muted/20 p-3'>
            <p className='text-xs text-muted-foreground'>状态</p>
            <p className='mt-1 text-sm font-semibold'>
              {character.status || 'unknown'}
            </p>
          </div>
        </div>
        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            创建于 {formatDateTime(character.createdAt)} · 更新于{' '}
            {formatDateTime(character.updatedAt)}
          </p>
          {character.tags && character.tags.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {character.tags.map((tag) => (
                <Badge key={tag} variant='outline'>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>未设置标签</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
