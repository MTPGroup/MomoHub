import { Camera } from 'lucide-react'
import { PublicField } from '#/components/shared/public-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import type { KnowledgeBaseListState } from '../hooks/use-knowledge-base-list'
import { getInitialChar } from '../utils'

export function KnowledgeBaseCreateDialog({
  list,
}: {
  list: KnowledgeBaseListState
}) {
  return (
    <Dialog
      open={list.state.createDialogOpen}
      onOpenChange={(open) => {
        list.actions.setCreateDialogOpen(open)
        if (!open) {
          list.actions.clearCreateAvatarSelection()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建知识库</DialogTitle>
          <DialogDescription>
            填写基本信息并设置公开性，创建后会自动跳转到管理页。
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              className='group relative'
              onClick={() => list.refs.avatarInputRef.current?.click()}
              aria-label='选择知识库头像'
            >
              <Avatar className='size-16 border border-border/80'>
                <AvatarImage
                  src={list.form.createAvatarPreviewUrl}
                  alt='知识库头像预览'
                />
                <AvatarFallback className='text-base'>
                  {getInitialChar(list.form.createName)}
                </AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
                <Camera className='size-4 text-background' />
              </div>
            </button>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-sm font-medium'>知识库头像</p>
              <p className='truncate text-xs text-muted-foreground'>
                {list.form.createAvatarFile
                  ? list.form.createAvatarFile.name
                  : '点击头像选择本地图片'}
              </p>
            </div>
            {list.form.createAvatarFile && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={list.actions.clearCreateAvatarSelection}
              >
                清除
              </Button>
            )}
            <input
              ref={list.refs.avatarInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={list.actions.changeCreateAvatar}
            />
          </div>
          <Input
            value={list.form.createName}
            onChange={(event) =>
              list.form.setCreateName(event.target.value)
            }
            placeholder='知识库名称'
          />
          <Textarea
            value={list.form.createDescription}
            onChange={(event) =>
              list.form.setCreateDescription(event.target.value)
            }
            placeholder='知识库描述（可选）'
          />
          <PublicField
            checked={list.form.createPublic}
            onCheckedChange={list.form.setCreatePublic}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            onClick={list.actions.create}
            disabled={list.state.isCreating}
          >
            {list.state.isCreating ? '创建中...' : '创建知识库'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
