import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentAuthUser, refresh } from '#/client/sdk.gen'

export interface User {
  name: string
  avatar: string
  status: 'inactive' | 'active' | 'banned' | 'unknown'
}

export interface AuthState {
  user: User | null
  hydrated: boolean
  setAuth: (user?: User) => void
  logout: () => void
  setHydrated: (value: boolean) => void
}

export type SetAuthPayload = {
  user?: User | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setAuth: (user) => {
        set((state) => ({
          user: user ?? state.user,
          hydrated: true,
        }))
      },
      logout: () => set({ user: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

export const getAuth = useAuthStore.getState

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

export function setAuth(payload: SetAuthPayload) {
  useAuthStore.setState((state) => {
    let nextUser = state.user

    if ('user' in payload) {
      nextUser = payload.user ?? null
    }

    return {
      ...state,
      user: nextUser,
      hydrated: true,
    }
  })
}

export function clearAuth() {
  useAuthStore.setState((state) => ({
    ...state,
    user: null,
  }))
}

let refreshPromise: Promise<boolean | null> | null = null

export async function refreshToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      await refresh({
        body: null,
        throwOnError: true,
      })

      const res = await getCurrentAuthUser({
        throwOnError: true,
        headers: { 'X-Retry': 'true' },
      })

      const userData = res.data?.data

      if (userData) {
        setAuth({
          user: {
            name: userData?.name,
            avatar: userData?.avatar,
            status: userData?.status,
          },
        })
      }
      return true
    } catch {
      useAuthStore.getState().logout()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
