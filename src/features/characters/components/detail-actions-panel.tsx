import { BookOpen, Bot, Heart, PencilLine, Trash2 } from 'lucide-react'
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
import { AuthActionButton } from '#/features/auth/components/auth-action-button'

type CharacterDetailActionsPanelProps = {
  characterId: string
  characterName: string
  isFavorited?: boolean | null
  isAuthenticated: boolean
  isAuthReady: boolean
  canManage: boolean
  canOpenKnowledgeBinding: boolean
  favoritePending: boolean
  deletePending: boolean
  onEdit: () => void
  onOpenDetailTest: (id: string) => void
  onOpenKnowledgeBinding: () => void
  onToggleFavorite: () => void
  onDelete: (id: string) => void
}

export function CharacterDetailActionsPanel({
  characterId,
  characterName,
  isFavorited,
  isAuthenticated,
  isAuthReady,
  canManage,
  canOpenKnowledgeBinding,
  favoritePending,
  deletePending,
  onEdit,
  onOpenDetailTest,
  onOpenKnowledgeBinding,
  onToggleFavorite,
  onDelete,
}: CharacterDetailActionsPanelProps) {
  return (
    <ResponsiveActionPanel
      title='操作面板'
      description={
        isAuthenticated
          ? '管理您的角色'
          : '公开内容可直接查看，互动和管理操作需要登录。'
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
              onEdit()
              closeMobilePanel()
            }}
          >
            <PencilLine className='size-4' />
            编辑角色
          </AuthActionButton>
          <AuthActionButton
            type='button'
            variant='outline'
            className='w-full justify-start'
            isAuthenticated={isAuthenticated}
            isAuthReady={isAuthReady}
            loginLabel={
              <>
                <Bot className='size-4' />
                登录后测试
              </>
            }
            onClick={() => {
              onOpenDetailTest(characterId)
              closeMobilePanel()
            }}
          >
            <Bot className='size-4' />
            详情测试
          </AuthActionButton>
          <AuthActionButton
            type='button'
            variant='outline'
            className='w-full justify-start'
            isAuthenticated={isAuthenticated}
            isAuthReady={isAuthReady}
            isAllowed={canManage}
            disabled={!canOpenKnowledgeBinding}
            loginLabel={
              <>
                <BookOpen className='size-4' />
                登录后关联
              </>
            }
            unauthorizedLabel={
              <>
                <BookOpen className='size-4' />
                仅作者可关联
              </>
            }
            onClick={() => {
              onOpenKnowledgeBinding()
              closeMobilePanel()
            }}
          >
            <BookOpen className='size-4' />
            关联知识库
          </AuthActionButton>
          <AuthActionButton
            type='button'
            variant='outline'
            className='w-full justify-start'
            isAuthenticated={isAuthenticated}
            isAuthReady={isAuthReady}
            disabled={favoritePending}
            loginLabel={
              <>
                <Heart className='size-4' />
                登录后收藏
              </>
            }
            onClick={() => {
              onToggleFavorite()
              closeMobilePanel()
            }}
          >
            <Heart
              className={`size-4 ${isFavorited ? 'fill-current text-primary' : ''}`}
            />
            {isFavorited ? '取消收藏' : '收藏角色'}
          </AuthActionButton>
          {isAuthenticated && canManage ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type='button'
                  variant='destructive'
                  className='w-full justify-start'
                  disabled={deletePending}
                  onClick={closeMobilePanel}
                >
                  <Trash2 className='size-4' />
                  删除角色
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size='sm'>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除角色？</AlertDialogTitle>
                  <AlertDialogDescription>
                    删除后将无法恢复角色设定及其关联会话：{characterName}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    variant='destructive'
                    onClick={() => onDelete(characterId)}
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
              删除角色
            </AuthActionButton>
          )}
        </>
      )}
    />
  )
}
