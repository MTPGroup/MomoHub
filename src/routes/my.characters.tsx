import { createFileRoute } from '@tanstack/react-router'
import { AuthRequired } from '#/components/shared/auth-required'
import { CharactersPage } from './characters'

export const Route = createFileRoute('/my/characters')({
  component: MyCharactersPage,
})

function MyCharactersPage() {
  return (
    <AuthRequired
      title='需要登录后访问我的角色'
      description='登录后可查看并管理你创建的全部角色。'
    >
      <CharactersPage mineOnly />
    </AuthRequired>
  )
}
