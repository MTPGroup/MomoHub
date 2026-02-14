import { defineStore } from 'pinia'
import type {
  ApiResponse,
  LoginResponse,
  SignInWithPasswordRequest,
  SignUpRequest,
  TokenResponse,
  UserProfile
} from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const accessToken = useCookie('auth_access_token', { maxAge: 60 * 60 })
  const refreshTokenCookie = useCookie('auth_refresh_token', { maxAge: 60 * 60 * 24 * 30 })
  const user = ref<UserProfile | null>(null)
  const showAuthModal = ref(false)

  const isLoggedIn = computed(() => !!accessToken.value)

  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  const openAuthModal = () => {
    showAuthModal.value = true
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshTokenCookie.value = null
    user.value = null
    stopRefreshTimer()
  }

  const setTokens = (tokens: TokenResponse) => {
    accessToken.value = tokens.accessToken
    refreshTokenCookie.value = tokens.refreshToken
    scheduleRefresh(tokens.accessTokenExpiredIn)
  }

  const scheduleRefresh = (expiresInSeconds: number) => {
    stopRefreshTimer()
    // 在过期前 30 秒刷新
    const delay = Math.max((expiresInSeconds - 30) * 1000, 5000)
    refreshTimer = setTimeout(() => {
      refreshAccessToken()
    }, delay)
  }

  const stopRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    if (!refreshTokenCookie.value) {
      clearTokens()
      return false
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const response = await $fetch<ApiResponse<LoginResponse>>(`${baseURL}/auth/refresh`, {
          method: 'POST',
          body: { refreshToken: refreshTokenCookie.value }
        })
        if (response.success && response.data) {
          setTokens(response.data.tokens)
          user.value = response.data.user
          return true
        }
        clearTokens()
        return false
      } catch {
        clearTokens()
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  const login = async (credentials: SignInWithPasswordRequest) => {
    const response = await $fetch<ApiResponse<LoginResponse>>(`${baseURL}/auth/sign-in/email`, {
      method: 'POST',
      body: credentials
    })
    if (response.success && response.data) {
      setTokens(response.data.tokens)
      user.value = response.data.user
    }
    return response
  }

  // TODO: 注册后返回的是SuccessResponse，需要接着验证邮箱后才能登录
  const register = async (data: SignUpRequest) => {
    const response = await $fetch<ApiResponse<LoginResponse>>(`${baseURL}/auth/sign-up/email`, {
      method: 'POST',
      body: data
    })
    if (response.success && response.data) {
      setTokens(response.data.tokens)
      user.value = response.data.user
    }
    return response
  }

  const logout = () => {
    clearTokens()
    navigateTo('/')
  }

  const fetchUser = async () => {
    if (!accessToken.value) return
    try {
      const response = await $fetch<ApiResponse<UserProfile>>(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      })
      if (response.success && response.data) {
        user.value = response.data
      }
    } catch {
      clearTokens()
    }
  }

  // 初始化：如果有 token 则加载用户信息并安排刷新
  const init = async () => {
    if (accessToken.value) {
      await fetchUser()
      // 无法知道剩余过期时间，默认 5 分钟后刷新
      if (isLoggedIn.value) {
        scheduleRefresh(3600)
      }
    }
  }

  return {
    accessToken,
    user,
    isLoggedIn,
    showAuthModal,
    openAuthModal,
    login,
    register,
    logout,
    fetchUser,
    refreshAccessToken,
    init
  }
})
