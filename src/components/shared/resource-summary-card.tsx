import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

interface ResourceSummaryCardProps {
  title: string
  description: string
  avatarSrc?: string
  avatarFallback: string
  statusText?: string
  statusClassName?: string
  visibilityText: string
  visibilityVariant?: 'secondary' | 'outline'
  authorName: string
  authorAvatarSrc?: string
  authorAvatarFallback: string
  metaText?: string
  onClick: () => void
}

export function ResourceSummaryCard({
  title,
  description,
  avatarSrc = '',
  avatarFallback,
  statusText,
  statusClassName,
  visibilityText,
  visibilityVariant = 'outline',
  authorName,
  authorAvatarSrc = '',
  authorAvatarFallback,
  metaText,
  onClick,
}: ResourceSummaryCardProps) {
  return (
    <Card
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className='group h-full cursor-pointer border bg-card py-5 transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md'
    >
      <CardHeader className='px-5'>
        <div className='grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3'>
          <Avatar className='mt-0.5 h-14 w-14'>
            <AvatarImage src={avatarSrc} alt={title} />
            <AvatarFallback className='text-lg'>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 space-y-1.5'>
            <div className='flex items-start justify-between gap-2'>
              <CardTitle className='line-clamp-2 text-base leading-6'>
                {title}
              </CardTitle>
              {statusText ? (
                <Badge
                  variant='outline'
                  className={
                    statusClassName ? `text-xs ${statusClassName}` : 'text-xs'
                  }
                >
                  {statusText}
                </Badge>
              ) : null}
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-5 text-sm'>
        <div className='flex items-center justify-between border-t pt-2 text-xs'>
          <Badge variant={visibilityVariant}>{visibilityText}</Badge>
          <div className='inline-flex items-center gap-2 text-muted-foreground'>
            <Avatar size='sm'>
              <AvatarImage src={authorAvatarSrc} alt={authorName} />
              <AvatarFallback>{authorAvatarFallback}</AvatarFallback>
            </Avatar>
            <span className='max-w-36 truncate'>{authorName}</span>
          </div>
        </div>
        {metaText ? (
          <p className='mt-2 text-xs text-muted-foreground'>{metaText}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
