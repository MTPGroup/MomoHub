import { createFileRoute } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { AuthRequired } from '#/features/auth/components/auth-required'
import { Route as CharactersRoute } from '../characters'

export const Route = createFileRoute('/my/characters')({
  component: MyCharactersPage,
})

function MyCharactersPage() {
  const CharactersPage = CharactersRoute.options.component as ComponentType<{
    mineOnly?: boolean
  }>

  return (
    <AuthRequired
      title='需要登录后访问我的角色'
      description='登录后可查看并管理你创建的全部角色。'
    >
      <CharactersPage mineOnly />
    </AuthRequired>
  )
}
