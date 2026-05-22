import { Plus } from 'lucide-react'
import { AuthForm } from '#/features/auth/components/auth-form'
import { ResourceListLayout } from '#/components/shared/resource-list-layout'
import { ResourceSummaryCard } from '#/components/shared/resource-summary-card'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import type { useAuth } from '#/hooks/use-auth'
import { formatDateTime } from '#/lib/format'
import type { KnowledgeBaseListState } from '../hooks/use-knowledge-base-list'
import {
  getInitialChar,
  getKbStatusBadgeClassName,
} from '../utils'
import { KnowledgeBaseCreateDialog } from './knowledge-base-create-dialog'

type AuthState = ReturnType<typeof useAuth>

export function KnowledgeBaseListContent({
  auth,
  list,
  mineOnly,
}: {
  auth: AuthState
  list: KnowledgeBaseListState
  mineOnly: boolean
}) {
  return (
    <ResourceListLayout
      title={mineOnly ? '我的知识库' : '知识库管理与探索'}
      description={
        mineOnly
          ? '仅展示你创建的知识库，便于集中管理文档与处理流程。'
          : '探索和管理知识库资源'
      }
      searchValue={list.state.searchValue}
      onSearchChange={list.actions.setSearchValue}
      searchPlaceholder='输入关键词过滤知识库'
      createTitle='新建知识库'
      createDescription={`建议按拆分知识库，后续进入子页面管理文档队列。${
        !auth.isLoggedIn ? ' 当前为浏览模式，登录后可创建与管理。' : ''
      }`}
      createAction={
        auth.isLoggedIn ? (
          <Button
            type='button'
            onClick={() => list.actions.setCreateDialogOpen(true)}
          >
            <Plus className='size-4' />
            新建知识库
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
        <>
          {list.data.items.length === 0 && (
            <Card className='gap-2 border-dashed py-10 text-center'>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  没有匹配的知识库
                </p>
              </CardContent>
            </Card>
          )}
          {list.data.privateCount > 0 && (
            <p className='text-xs text-muted-foreground'>
              已检索到 {list.data.items.length} 个知识库，其中{' '}
              {list.data.privateCount} 个为私有知识库。
            </p>
          )}
        </>
      }
    >
      <KnowledgeBaseCreateDialog list={list} />

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {list.data.items.map((item) => (
          <ResourceSummaryCard
            key={item.id}
            onClick={() => list.actions.openDetail(item.id)}
            title={item.name}
            description={item.description || '暂无描述'}
            avatarSrc={item.avatar || ''}
            avatarFallback={getInitialChar(item.name)}
            statusText={item.status}
            statusClassName={getKbStatusBadgeClassName(item.status)}
            visibilityText={item.isPublic ? '公开' : '私有'}
            visibilityVariant={item.isPublic ? 'secondary' : 'outline'}
            authorName={item.authorName || item.authorId}
            authorAvatarSrc={item.authorAvatar || ''}
            authorAvatarFallback={getInitialChar(
              item.authorName || item.authorId,
            )}
            metaText={`更新于 ${formatDateTime(item.updatedAt)}`}
          />
        ))}
      </section>
    </ResourceListLayout>
  )
}
