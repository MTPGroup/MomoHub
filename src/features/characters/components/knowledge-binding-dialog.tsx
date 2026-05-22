import Fuse from 'fuse.js'
import { Loader2 } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { SearchBar } from '#/components/shared/search-bar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ScrollArea } from '#/components/ui/scroll-area'

type KnowledgeBaseBrief = {
  id: string
  name: string
  description?: string | null
  isPublic: boolean
}

type CharacterKnowledgeBindingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkedKnowledgeBases: KnowledgeBaseBrief[]
  availableKnowledgeBases: KnowledgeBaseBrief[]
  isMutating: boolean
  onToggleBinding: (knowledgeBaseId: string) => void
}

export function CharacterKnowledgeBindingDialog({
  open,
  onOpenChange,
  linkedKnowledgeBases,
  availableKnowledgeBases,
  isMutating,
  onToggleBinding,
}: CharacterKnowledgeBindingDialogProps) {
  const linkedIds = new Set(linkedKnowledgeBases.map((item) => item.id))
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const fuse = useMemo(() => {
    return new Fuse<KnowledgeBaseBrief>(availableKnowledgeBases, {
      keys: ['name'],
      threshold: 0.3,
      ignoreLocation: true,
    })
  }, [availableKnowledgeBases])

  const filteredAvailableKnowledgeBases = useMemo(() => {
    if (!deferredQuery) return availableKnowledgeBases
    return fuse.search(deferredQuery).map((result) => result.item)
  }, [deferredQuery, fuse, availableKnowledgeBases])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>角色知识库关联</DialogTitle>
          <DialogDescription>选择要关联到当前角色的知识库。</DialogDescription>
        </DialogHeader>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          placeholder='搜索可用的知识库'
          rounded='md'
        />
        <ScrollArea className='max-h-[60vh] space-y-3 overflow-y-auto pr-1'>
          {availableKnowledgeBases.length === 0 ? (
            <div className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
              暂无可关联知识库，请先创建知识库。
            </div>
          ) : (
            filteredAvailableKnowledgeBases.map((kb) => {
              const linked = linkedIds.has(kb.id)

              return (
                <div
                  key={kb.id}
                  className='flex items-start justify-between gap-3 rounded-md border p-3'
                >
                  <div className='min-w-0 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-medium'>{kb.name}</p>
                      <Badge variant={kb.isPublic ? 'secondary' : 'outline'}>
                        {kb.isPublic ? '公开' : '私有'}
                      </Badge>
                      {linked ? <Badge>已关联</Badge> : null}
                    </div>
                    <p className='line-clamp-2 text-xs text-muted-foreground'>
                      {kb.description || '暂无描述'}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant={linked ? 'outline' : 'default'}
                    size='sm'
                    disabled={isMutating}
                    onClick={() => onToggleBinding(kb.id)}
                  >
                    {isMutating ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : null}
                    {linked ? '取消关联' : '关联'}
                  </Button>
                </div>
              )
            })
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
