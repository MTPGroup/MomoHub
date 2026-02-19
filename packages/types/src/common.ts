export interface ApiResponse<T> {
  success: boolean
  code: string | null
  message: string
  data: T | null
  errors: Record<string, string> | null
  timestamp: string
}

export interface SuccessResponse {
  success: boolean
}

export interface UploadAvatarResponse {
  avatar: string
}

export interface PagedResponse<T = unknown> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return fallback
}

export function getApiErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { code?: string } }).data
    if (data?.code) return data.code
  }
  return null
}
