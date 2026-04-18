import { Store, useStore } from '@tanstack/react-store'

interface AuthState {
  name: string
  avatar: string
  status: 'inactive' | 'active' | 'banned' | 'unknown'
  accessToken: string
  refreshToken: string
}

const authStore = new Store<AuthState>({
  name: '',
  avatar: '',
  status: 'unknown',
  accessToken: '',
  refreshToken: '',
})

export const useAuth = () => useStore(authStore, (state) => state)

export function setAuth(payload: Partial<AuthState>) {
  authStore.setState((state) => ({
    ...state,
    ...payload,
  }))
}

export function clearAuth() {
  authStore.setState(() => ({
    name: '',
    avatar: '',
    status: 'unknown',
    accessToken: '',
    refreshToken: '',
  }))
}

export { authStore }
