import type {
  ApiResponse,
  ChangePasswordRequest,
  LoginResponse,
  ResetPasswordRequest,
  SendOtpRequest,
  SignInWithPasswordRequest,
  SignUpRequest,
  SuccessResponse,
  TokenResponse,
  UpdateProfileRequest,
  UploadAvatarResponse,
  UserProfile,
  VerifyOTPRequest,
} from '@momohub/types'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const accessToken = useCookie('auth_access_token', { maxAge: 60 * 60 })
  const refreshTokenCookie = useCookie('auth_refresh_token', {
    maxAge: 60 * 60 * 24 * 30,
  })
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

  const scheduleRefresh = (expiresInTimestamp: number) => {
    stopRefreshTimer()
    const nowInMs = Date.now()
    const remainingMs = Math.max(0, expiresInTimestamp - nowInMs)
    const delay = Math.max(remainingMs - 30 * 1000, 5000)
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
        const response = await $fetch<ApiResponse<LoginResponse>>(
          `${baseURL}/auth/refresh`,
          {
            method: 'POST',
            body: { refreshToken: refreshTokenCookie.value },
          },
        )
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
    const response = await $fetch<ApiResponse<LoginResponse>>(
      `${baseURL}/auth/sign-in/email`,
      {
        method: 'POST',
        body: credentials,
      },
    )
    if (response.success && response.data) {
      setTokens(response.data.tokens)
      user.value = response.data.user
    }
    return response
  }

  const register = async (data: SignUpRequest) => {
    return await $fetch<ApiResponse<SuccessResponse>>(
      `${baseURL}/auth/sign-up/email`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  const sendOtp = async (data: SendOtpRequest) => {
    return await $fetch<ApiResponse<SuccessResponse>>(
      `${baseURL}/auth/email-otp/send`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  const verifyEmail = async (data: VerifyOTPRequest) => {
    return await $fetch<ApiResponse<SuccessResponse>>(
      `${baseURL}/auth/email-otp/verify-email`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  const resetPassword = async (data: ResetPasswordRequest) => {
    return await $fetch<ApiResponse<SuccessResponse>>(
      `${baseURL}/auth/email-otp/reset-password`,
      {
        method: 'POST',
        body: data,
      },
    )
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    const response = await $fetch<ApiResponse<UserProfile>>(
      `${baseURL}/auth/me`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken.value}` },
        body: data,
      },
    )
    if (response.success && response.data) {
      user.value = response.data
    }
    return response
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await $fetch<ApiResponse<UploadAvatarResponse>>(
      `${baseURL}/auth/me/avatar`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken.value}` },
        body: formData,
      },
    )
    return response
  }

  const changePassword = async (data: ChangePasswordRequest) => {
    return await $fetch<ApiResponse<SuccessResponse>>(
      `${baseURL}/auth/password/change`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken.value}` },
        body: data,
      },
    )
  }

  const logout = async () => {
    if (refreshTokenCookie.value) {
      try {
        await $fetch(`${baseURL}/auth/sign-out`, {
          method: 'POST',
          body: { refreshToken: refreshTokenCookie.value },
          headers: { Authorization: `Bearer ${accessToken.value}` },
        })
      } catch {
        // 忽略服务端错误，继续清除本地状态
      }
    }
    clearTokens()
    navigateTo('/')
  }

  const deleteAccount = async () => {
    await $fetch(`${baseURL}/auth/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })
    clearTokens()
    navigateTo('/')
  }

  const fetchUser = async () => {
    if (!accessToken.value) return
    try {
      const response = await $fetch<ApiResponse<UserProfile>>(
        `${baseURL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${accessToken.value}` },
        },
      )
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
    sendOtp,
    verifyEmail,
    resetPassword,
    updateProfile,
    uploadAvatar,
    changePassword,
    logout,
    deleteAccount,
    fetchUser,
    refreshAccessToken,
    init,
  }
})
