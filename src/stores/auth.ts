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
let refreshPromise: Promise<string> | null = null

export function useAuth() {
  return useStore(authStore, (state) => state)
}

export function getAccessToken() {
  return authStore.state.accessToken
}

export function setAuth(payload: Partial<AuthState>) {
  authStore.setState((state) => ({
    ...state,
    ...payload,
  }))
}

export function clearAuth() {
  authStore.setState(() => EMPTY_AUTH_STATE)
}

function decodeJwtPayload(token: string) {
  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4)
    const json = atob(normalized)
    return JSON.parse(json) as { exp?: number }
  } catch {
    return null
  }
}

function shouldRefreshAccessToken(token: string, skewSeconds = 30) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (!exp) {
    return false
  }
  const now = Math.floor(Date.now() / 1000)
  return exp <= now + skewSeconds
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshResult = await refresh({
      body: null,
      throwOnError: true,
    })
    const accessToken = refreshResult.data?.data?.accessToken
    if (!accessToken) {
      clearAuth()
      throw new Error('刷新 access token 失败')
    }
    setAuth({ accessToken })
    return accessToken
  })()

  try {
    return await refreshPromise
  } catch (error) {
    clearAuth()
    throw error
  } finally {
    refreshPromise = null
  }
}

export async function getValidAccessToken() {
  const current = getAccessToken()
  if (!current) {
    return ''
  }

  if (!shouldRefreshAccessToken(current)) {
    return current
  }

  try {
    return await refreshAccessToken()
  } catch {
    return ''
  }
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
      const accessToken = await refreshAccessToken()
      if (!accessToken) return

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
