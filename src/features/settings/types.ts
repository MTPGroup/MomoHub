export interface SessionItem {
  sessionId: string
  identityType: string
  deviceFingerprint: string
  expiresAt: string
  isCurrent: boolean
}

export interface AuditLogItem {
  id: string
  eventType: string
  payload?: unknown
  processed?: boolean
  retryCount?: number
  createdAt?: string
  publishedAt?: string | null
}

export interface AuditLogsData {
  items?: AuditLogItem[]
  total?: number
  page?: number
  pageSize?: number
  totalPages?: number
}
