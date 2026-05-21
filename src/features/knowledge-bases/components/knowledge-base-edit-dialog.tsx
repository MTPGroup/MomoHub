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
import type { KnowledgeBaseDetailState } from '../hooks/use-knowledge-base-detail'
import { getInitialChar } from '../utils'

export function KnowledgeBaseEditDialog({
  knowledgeBase,
}: {
  knowledgeBase: KnowledgeBaseDetailState
}) {
  return (
    <Dialog
      open={knowledgeBase.state.isEditDialogOpen}
      onOpenChange={(open) => {
        if (open) {
          knowledgeBase.actions.openDialog()
        } else {
          knowledgeBase.actions.closeDialog()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑知识库</DialogTitle>
          <DialogDescription>
            修改名称、描述和可见性设置，保存后立即生效。
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              className='group relative'
              onClick={() =>
                knowledgeBase.refs.editAvatarInputRef.current?.click()
              }
              aria-label='选择知识库头像'
            >
              <Avatar className='size-16 border border-border'>
                <AvatarImage
                  src={knowledgeBase.form.editAvatarPreviewUrl}
                  alt='知识库头像预览'
                />
                <AvatarFallback className='text-base'>
                  {getInitialChar(
                    knowledgeBase.form.editName || knowledgeBase.data.kb?.name,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
                <Camera className='size-4 text-background' />
              </div>
            </button>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-sm font-medium'>知识库头像</p>
              <p className='truncate text-xs text-muted-foreground'>
                {knowledgeBase.form.editAvatarFile
                  ? knowledgeBase.form.editAvatarFile.name
                  : '点击头像选择本地图片'}
              </p>
            </div>
            {knowledgeBase.form.editAvatarFile && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() =>
                  knowledgeBase.actions.clearEditAvatarSelection(
                    knowledgeBase.data.kb?.avatar || '',
                  )
                }
              >
                清除
              </Button>
            )}
            <input
              ref={knowledgeBase.refs.editAvatarInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={knowledgeBase.actions.changeAvatar}
            />
          </div>
          <Input
            value={knowledgeBase.form.editName}
            onChange={(event) =>
              knowledgeBase.form.setEditName(event.target.value)
            }
            placeholder='知识库名称'
          />
          <Textarea
            value={knowledgeBase.form.editDescription}
            onChange={(event) =>
              knowledgeBase.form.setEditDescription(event.target.value)
            }
            placeholder='知识库描述'
          />
          <PublicField
            checked={knowledgeBase.form.editPublic}
            onCheckedChange={knowledgeBase.form.setEditPublic}
          />
        </div>
        <DialogFooter>
          <Button variant='ghost' onClick={knowledgeBase.actions.closeDialog}>
            取消
          </Button>
          <Button
            onClick={knowledgeBase.actions.update}
            disabled={knowledgeBase.state.isUpdating}
          >
            {knowledgeBase.state.isUpdating ? '保存中...' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
