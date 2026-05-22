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

type CharacterDetailActionsPanelProps = {
  characterId: string
  characterName: string
  isFavorited?: boolean | null
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
      description='管理您的角色'
      renderActions={(closeMobilePanel) => (
        <>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            onClick={() => {
              onEdit()
              closeMobilePanel()
            }}
          >
            <PencilLine className='size-4' />
            编辑角色
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            onClick={() => {
              onOpenDetailTest(characterId)
              closeMobilePanel()
            }}
          >
            <Bot className='size-4' />
            详情测试
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            disabled={!canOpenKnowledgeBinding}
            onClick={() => {
              onOpenKnowledgeBinding()
              closeMobilePanel()
            }}
          >
            <BookOpen className='size-4' />
            关联知识库
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'
            disabled={favoritePending}
            onClick={() => {
              onToggleFavorite()
              closeMobilePanel()
            }}
          >
            <Heart
              className={`size-4 ${isFavorited ? 'fill-current text-primary' : ''}`}
            />
            {isFavorited ? '取消收藏' : '收藏角色'}
          </Button>
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
        </>
      )}
    />
  )
}
