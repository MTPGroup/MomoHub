import { FileUp, PencilLine, RefreshCcw, Trash2 } from 'lucide-react'
import { ResponsiveActionPanel } from '#/components/shared/responsive-action-panel'
import { AuthActionButton } from '#/features/auth/components/auth-action-button'
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
  isAuthenticated,
  isAuthReady,
  canManage,
}: {
  knowledgeBase: KnowledgeBaseDetailState
  documents: DocumentStates
  isAuthenticated: boolean
  isAuthReady: boolean
  canManage: boolean
}) {
  return (
    <ResponsiveActionPanel
      title='操作面板'
      description={
        isAuthenticated
          ? '常用管理操作集中在此。'
          : '公开内容可直接查看，管理操作需要登录。'
      }
      renderActions={(closeMobilePanel) => (
        <>
          <AuthActionButton
            type='button'
            variant='outline'
            className='w-full justify-start'
            isAuthenticated={isAuthenticated}
            isAuthReady={isAuthReady}
            isAllowed={canManage}
            loginLabel={
              <>
                <PencilLine className='size-4' />
                登录后编辑
              </>
            }
            unauthorizedLabel={
              <>
                <PencilLine className='size-4' />
                仅作者可编辑
              </>
            }
            onClick={() => {
              knowledgeBase.actions.openDialog()
              closeMobilePanel()
            }}
          >
            <PencilLine className='size-4' />
            编辑知识库
          </AuthActionButton>
          {isAuthenticated && canManage ? (
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
          ) : (
            <AuthActionButton
              type='button'
              variant='outline'
              className='w-full justify-start'
              isAuthenticated={isAuthenticated}
              isAuthReady={isAuthReady}
              isAllowed={canManage}
              loginLabel={
                <>
                  <FileUp className='size-4' />
                  登录后上传
                </>
              }
              unauthorizedLabel={
                <>
                  <FileUp className='size-4' />
                  仅作者可上传
                </>
              }
            >
              <FileUp className='size-4' />
              上传文档
            </AuthActionButton>
          )}
          <AuthActionButton
            type='button'
            variant='outline'
            className='w-full justify-start'
            isAuthenticated={isAuthenticated}
            isAuthReady={isAuthReady}
            isAllowed={canManage}
            loginLabel={
              <>
                <RefreshCcw className='size-4' />
                登录后刷新
              </>
            }
            unauthorizedLabel={
              <>
                <RefreshCcw className='size-4' />
                仅作者可刷新
              </>
            }
            onClick={() => {
              knowledgeBase.actions.refreshQueue()
              closeMobilePanel()
            }}
          >
            <RefreshCcw className='size-4' />
            刷新队列
          </AuthActionButton>
          {isAuthenticated && canManage ? (
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
          ) : (
            <AuthActionButton
              type='button'
              variant='destructive'
              className='w-full justify-start'
              isAuthenticated={isAuthenticated}
              isAuthReady={isAuthReady}
              isAllowed={canManage}
              loginLabel={
                <>
                  <Trash2 className='size-4' />
                  登录后管理
                </>
              }
              unauthorizedLabel={
                <>
                  <Trash2 className='size-4' />
                  仅作者可删除
                </>
              }
            >
              <Trash2 className='size-4' />
              删除知识库
            </AuthActionButton>
          )}
        </>
      )}
    />
  )
}
