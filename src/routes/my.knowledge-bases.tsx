import { createFileRoute } from '@tanstack/react-router'
import { AuthRequired } from '#/components/shared/auth-required'
import { KnowledgeBasesPage } from './knowledge-bases'

export const Route = createFileRoute('/my/knowledge-bases')({
  component: MyKnowledgeBasesPage,
})

function MyKnowledgeBasesPage() {
  return (
    <AuthRequired
      title='需要登录后访问我的知识库'
      description='登录后可查看并管理你创建的全部知识库。'
    >
      <KnowledgeBasesPage mineOnly />
    </AuthRequired>
  )
}
