import { createFileRoute } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { AuthRequired } from '#/components/shared/auth-required'
import { Route as KnowledgeBasesRoute } from '../knowledge-bases'

export const Route = createFileRoute('/my/knowledge-bases')({
  component: MyKnowledgeBasesPage,
})

function MyKnowledgeBasesPage() {
  const KnowledgeBasesPage = KnowledgeBasesRoute.options
    .component as ComponentType<{ mineOnly?: boolean }>

  return (
    <AuthRequired
      title='需要登录后访问我的知识库'
      description='登录后可查看并管理你创建的全部知识库。'
    >
      <KnowledgeBasesPage mineOnly />
    </AuthRequired>
  )
}
