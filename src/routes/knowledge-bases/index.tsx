import { createFileRoute, Outlet } from '@tanstack/react-router'
import { KnowledgeBaseListContent } from '#/features/knowledge-bases/components/knowledge-base-list-content'
import { useKnowledgeBaseList } from '#/features/knowledge-bases/hooks/use-knowledge-base-list'
import { useAuth } from '#/hooks/use-auth'

export const Route = createFileRoute('/knowledge-bases/')({
  component: KnowledgeBasesRoutePage,
})

function KnowledgeBasesRoutePage({ mineOnly = false }: { mineOnly?: boolean }) {
  const auth = useAuth()
  const list = useKnowledgeBaseList({ mineOnly })

  if (!list.state.isListPage) {
    return <Outlet />
  }

  return <KnowledgeBaseListContent auth={auth} list={list} mineOnly={mineOnly} />
}
