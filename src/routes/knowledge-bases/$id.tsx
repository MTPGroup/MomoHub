import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthRequired } from '#/features/auth/components/auth-required'
import { Card, CardContent } from '#/components/ui/card'
import { DocumentsCard } from '#/features/knowledge-bases/components/documents-card'
import { KnowledgeBaseActionsPanel } from '#/features/knowledge-bases/components/knowledge-base-actions-panel'
import { KnowledgeBaseEditDialog } from '#/features/knowledge-bases/components/knowledge-base-edit-dialog'
import { KnowledgeBaseSummaryCard } from '#/features/knowledge-bases/components/knowledge-base-summary-card'
import { useDocument } from '#/features/knowledge-bases/hooks/use-document'
import { useKnowledgeBaseDetail } from '#/features/knowledge-bases/hooks/use-knowledge-base-detail'
import { useAuth } from '#/hooks/use-auth'

export const Route = createFileRoute('/knowledge-bases/$id')({
  component: KnowledgeBaseDetailPage,
})

function KnowledgeBaseDetailPage() {
  const { id } = Route.useParams()
  const auth = useAuth()
  const navigate = useNavigate()

  const documents = useDocument({
    kbId: id,
    enabled: auth.isLoggedIn,
  })
  const knowledgeBase = useKnowledgeBaseDetail({
    kbId: id,
    enabled: auth.isLoggedIn,
    onDeleteKnowledgeBase: () => navigate({ to: '/knowledge-bases' }),
  })

  return (
    <AuthRequired
      title='知识库管理需要登录'
      description='请先登录后再管理知识库文档、上传文件和修改配置。'
    >
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
        <section className='space-y-3'>
          <Link
            to='/knowledge-bases'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            返回知识库列表
          </Link>
        </section>

        {!knowledgeBase.data.kb && knowledgeBase.state.isLoading && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>知识库加载中...</p>
            </CardContent>
          </Card>
        )}

        {!knowledgeBase.data.kb && !knowledgeBase.state.isLoading && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                知识库不存在或无访问权限
              </p>
            </CardContent>
          </Card>
        )}

        {knowledgeBase.data.kb && (
          <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='space-y-6'>
              <KnowledgeBaseSummaryCard knowledgeBase={knowledgeBase} />
              <DocumentsCard kbId={id} documents={documents} />
            </div>

            <KnowledgeBaseActionsPanel
              knowledgeBase={knowledgeBase}
              documents={documents}
            />
          </div>
        )}

        <KnowledgeBaseEditDialog knowledgeBase={knowledgeBase} />
      </div>
    </AuthRequired>
  )
}
