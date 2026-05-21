import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import type { KnowledgeBaseDetailState } from '../hooks/use-knowledge-base-detail'
import { getInitialChar } from '../utils'

export function KnowledgeBaseSummaryCard({
  knowledgeBase,
}: {
  knowledgeBase: KnowledgeBaseDetailState
}) {
  const kb = knowledgeBase.data.kb
  if (!kb) return null

  return (
    <Card className='gap-4 border bg-card py-5'>
      <CardHeader className='px-5'>
        <div className='flex items-start gap-3'>
          <Avatar className='mt-0.5 size-12 border border-border'>
            <AvatarImage src={kb.avatar || ''} alt={kb.name} />
            <AvatarFallback className='text-base'>
              {getInitialChar(kb.name)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <CardTitle className='text-base'>知识库信息 · {kb.name}</CardTitle>
            <CardDescription>
              {kb.description || '暂无描述'} · 更新时间：
              {formatDateTime(kb.updatedAt)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4 px-5'>
        <div className='flex items-center gap-2'>
          <Avatar className='size-6'>
            <AvatarImage
              src={kb.authorAvatar || ''}
              alt={kb.authorName || kb.authorId}
            />
            <AvatarFallback className='text-xs'>
              {getInitialChar(kb.authorName || kb.authorId)}
            </AvatarFallback>
          </Avatar>
          <p className='text-xs text-muted-foreground'>
            作者：{kb.authorName || kb.authorId}
          </p>
        </div>
        <div className='grid gap-3 sm:grid-cols-3'>
          <SummaryStat label='文档总数' value={kb.documentCount} />
          <SummaryStat label='片段总数' value={kb.chunkCount} />
          <SummaryStat
            label='可见性'
            value={kb.isPublic ? '公开知识库' : '私有知识库'}
            compact
          />
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryStat({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string | number
  compact?: boolean
}) {
  return (
    <div className='rounded-lg border bg-muted/20 p-3'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p
        className={
          compact ? 'mt-1 text-sm font-semibold' : 'mt-1 text-2xl font-semibold'
        }
      >
        {value}
      </p>
    </div>
  )
}
