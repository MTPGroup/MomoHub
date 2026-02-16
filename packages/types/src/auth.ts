export interface SignUpRequest {
  email: string
  name: string
  password: string
}

export interface SignInWithPasswordRequest {
  email: string
  password: string
}

export interface UserProfile {
  userId: string
  email: string
  username: string
  avatar: string | null
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiredIn: number
  refreshTokenExpiredIn: number
  tokenType?: string
}

export interface LoginResponse {
  user: UserProfile
  tokens: TokenResponse
}

export interface SendOtpRequest {
  email: string
  type: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  username?: string
}

export enum OtpType {
  RESET_PASSWORD = 'reset_password',
  VERIFY_EMAIL = 'verify_email',
  SIGN_IN = 'sign_in',
}
