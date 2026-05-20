import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getCurrentAuthUserOptions } from '#/client/@tanstack/react-query.gen'
import { clearAuth, setAuth } from '#/stores/auth'
import { useAuth } from './use-auth'

export function useSessionBootstrap() {
  const auth = useAuth()

  const query = useQuery({
    ...getCurrentAuthUserOptions(),
    enabled: auth.hydrated && !auth.isLoggedIn,
    retry: false,
    staleTime: 30_000,
  })

  useEffect(() => {
    const user = query.data?.data
    if (!user) return

    setAuth({
      user: {
        ...user,
      },
    })
  }, [query.data])

  useEffect(() => {
    if (!query.isError) return

    if (query.error.errorCode === 'UNAUTHORIZED') {
      clearAuth()
    }
  }, [query.isError, query.error])

  return query
}
