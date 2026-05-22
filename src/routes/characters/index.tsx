import { createFileRoute, Outlet } from '@tanstack/react-router'
import { CharacterListContent } from '#/features/characters/components/character-list-content'
import { useCharacterList } from '#/features/characters/hooks/use-character-list'
import { useAuth } from '#/hooks/use-auth'

export const Route = createFileRoute('/characters/')({
  component: CharactersRoutePage,
})

function CharactersRoutePage({ mineOnly = false }: { mineOnly?: boolean }) {
  const auth = useAuth()
  const list = useCharacterList({ mineOnly })

  if (!list.state.isListPage) {
    return <Outlet />
  }

  return <CharacterListContent auth={auth} list={list} mineOnly={mineOnly} />
}
