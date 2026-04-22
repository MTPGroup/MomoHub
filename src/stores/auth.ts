import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  name?: string
  avatar?: string
  status?: User['status']
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: true,
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
  const user = state.user
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
    } else if (
      payload.name !== undefined ||
      payload.avatar !== undefined ||
      payload.status !== undefined
    ) {
      nextUser = {
        name: payload.name ?? state.user?.name ?? '',
        avatar: payload.avatar ?? state.user?.avatar ?? '',
        status: payload.status ?? state.user?.status ?? 'unknown',
      }
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
