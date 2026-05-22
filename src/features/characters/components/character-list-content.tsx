import { Plus } from 'lucide-react'
import { AuthForm } from '#/features/auth/components/auth-form'
import { ResourceListLayout } from '#/components/shared/resource-list-layout'
import { ResourceSummaryCard } from '#/components/shared/resource-summary-card'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import type { useAuth } from '#/hooks/use-auth'
import { formatDateTime } from '#/lib/format'
import { getInitialChar } from '#/utils/character'
import type { CharacterListState } from '../hooks/use-character-list'
import { getCharacterStatusBadgeClassName } from '../utils'
import { CharacterCreateDialog } from './character-create-dialog'

type AuthState = ReturnType<typeof useAuth>

export function CharacterListContent({
  auth,
  list,
  mineOnly,
}: {
  auth: AuthState
  list: CharacterListState
  mineOnly: boolean
}) {
  return (
    <ResourceListLayout
      title={mineOnly ? '我的AI角色' : 'AI角色管理与探索'}
      description={
        mineOnly
          ? '仅展示你创建的角色，便于集中管理与维护。'
          : '发现和探索社区创建的 AI 角色'
      }
      searchValue={list.state.searchValue}
      onSearchChange={list.actions.setSearchValue}
      searchPlaceholder='输入关键词过滤角色'
      createTitle='新建角色'
      createDescription={`建议在简介中包含场景与边界，后续进入子页面管理角色配置。${
        !auth.isLoggedIn ? ' 当前为浏览模式，登录后可创建与管理。' : ''
      }`}
      createAction={
        auth.isLoggedIn ? (
          <Button
            type='button'
            onClick={() => list.actions.setCreateDialogOpen(true)}
          >
            <Plus className='size-4' />
            新建角色
          </Button>
        ) : (
          <AuthForm>
            <Button type='button' variant='outline'>
              登录后新建
            </Button>
          </AuthForm>
        )
      }
      footer={
        list.data.characters.length === 0 ? (
          <Card className='gap-2 border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>没有匹配的角色</p>
            </CardContent>
          </Card>
        ) : null
      }
    >
      <CharacterCreateDialog list={list} />

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {list.data.characters.map((item) => (
          <ResourceSummaryCard
            key={item.id}
            onClick={() => list.actions.openDetail(item.id)}
            title={item.name}
            description={item.bio || '暂无角色简介'}
            avatarSrc={item.avatar || ''}
            avatarFallback={getInitialChar(item.name)}
            statusText={item.status || 'unknown'}
            statusClassName={getCharacterStatusBadgeClassName(item.status)}
            visibilityText={item.isPublic ? '公开' : '私有'}
            visibilityVariant={item.isPublic ? 'secondary' : 'outline'}
            authorName={item.authorName || item.authorId}
            authorAvatarSrc={item.authorAvatar || ''}
            authorAvatarFallback={getInitialChar(
              item.authorName || item.authorId,
            )}
            metaText={`创建于 ${formatDateTime(item.createdAt)}`}
          />
        ))}
      </section>
    </ResourceListLayout>
  )
}
