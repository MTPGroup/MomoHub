import { useAuthStore } from '#/stores/auth'

export function useAuth() {
  const state = useAuthStore()
  const user = state.hydrated ? state.user : null
  const isLoggedIn = Boolean(user)

  return {
    ...state,
    user,
    isLoggedIn,
    name: user?.name || '',
    avatar: user?.avatar || '',
    status: user?.status || 'unknown',
  }
}
