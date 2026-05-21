import { FileUp, PencilLine, RefreshCcw, Trash2 } from 'lucide-react'
import { ResponsiveActionPanel } from '#/components/shared/responsive-action-panel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import type { DocumentStates } from '../hooks/use-document'
import type { KnowledgeBaseDetailState } from '../hooks/use-knowledge-base-detail'

export function KnowledgeBaseActionsPanel({
  knowledgeBase,
  documents,
}: {
  knowledgeBase: KnowledgeBaseDetailState
  documents: DocumentStates
}) {
  return (
    <ResponsiveActionPanel
      title='操作面板'
      description='常用管理操作集中在此。'
      renderActions={(closeMobilePanel) => (
        <>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            onClick={() => {
              knowledgeBase.actions.openDialog()
              closeMobilePanel()
            }}
          >
            <PencilLine className='size-4' />
            编辑知识库
          </Button>
          <label className='block'>
            <input
              type='file'
              className='hidden'
              onChange={(event) => {
                documents.actions.upload(event.target.files?.[0])
                event.currentTarget.value = ''
                closeMobilePanel()
              }}
            />
            <Button
              type='button'
              variant='outline'
              className='w-full justify-start'
              asChild
            >
              <span>
                <FileUp className='size-4' />
                上传文档
              </span>
            </Button>
          </label>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            onClick={() => {
              knowledgeBase.actions.refreshQueue()
              closeMobilePanel()
            }}
          >
            <RefreshCcw className='size-4' />
            刷新队列
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type='button'
                variant='destructive'
                className='w-full justify-start'
                disabled={knowledgeBase.state.isDeleting}
                onClick={closeMobilePanel}
              >
                <Trash2 className='size-4' />
                删除知识库
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size='sm'>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除知识库？</AlertDialogTitle>
                <AlertDialogDescription>
                  删除后将无法恢复知识库及其文档索引：
                  {knowledgeBase.data.kb?.name}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  variant='destructive'
                  onClick={knowledgeBase.actions.delete}
                >
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    />
  )
}
