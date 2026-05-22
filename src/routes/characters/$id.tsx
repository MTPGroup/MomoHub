import { createFileRoute, Outlet } from '@tanstack/react-router'
import { CharacterDetailContent } from '#/features/characters/components/character-detail-content'
import { useCharacterDetail } from '#/features/characters/hooks/use-character-detail'
import { useCharacterKnowledgeBinding } from '#/features/characters/hooks/use-character-knowledge-binding'
import { useAuth } from '#/hooks/use-auth'

export const Route = createFileRoute('/characters/$id')({
  component: CharacterDetailPage,
})

function CharacterDetailPage() {
  const { id } = Route.useParams()
  const auth = useAuth()
  const detail = useCharacterDetail({ id })
  const knowledgeBinding = useCharacterKnowledgeBinding({
    characterId: id,
    isAuthenticated: auth.isLoggedIn,
  })

  if (!detail.state.isDetailPage) {
    return <Outlet />
  }

  return (
    <CharacterDetailContent
      auth={auth}
      detail={detail}
      knowledgeBinding={knowledgeBinding}
    />
  )
}
