import { Store, useStore } from '@tanstack/react-store'
import { getCurrentUser, refresh } from '#/client/sdk.gen'

interface AuthState {
  name: string
  avatar: string
  status: 'inactive' | 'active' | 'banned' | 'unknown'
  accessToken: string
}

const EMPTY_AUTH_STATE: AuthState = {
  name: '',
  avatar: '',
  status: 'unknown',
  accessToken: '',
}
const authStore = new Store<AuthState>(EMPTY_AUTH_STATE)
let restorePromise: Promise<void> | null = null

export const useAuth = () => useStore(authStore, (state) => state)

export function setAuth(payload: Partial<AuthState>) {
  authStore.setState((state) => ({
    ...state,
    ...payload,
  }))
}

export function clearAuth() {
  authStore.setState(() => EMPTY_AUTH_STATE)
}

export async function restoreAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  if (restorePromise) {
    return restorePromise
  }

  restorePromise = (async () => {
    try {
      const refreshResult = await refresh({
        body: null,
        throwOnError: true,
      })
      const accessToken = refreshResult.data?.data?.accessToken
      if (!accessToken) {
        clearAuth()
        return
      }

      setAuth({ accessToken })

      const meResult = await getCurrentUser({
        throwOnError: true,
      })
      const user = meResult.data?.data
      if (!user) {
        clearAuth()
        return
      }

      setAuth({
        name: user.name,
        avatar: user.avatar,
        status: user.status,
      })
    } catch {
      clearAuth()
    }
  })()

  return restorePromise
}

export { authStore }
