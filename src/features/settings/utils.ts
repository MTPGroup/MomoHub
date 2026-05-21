export function maskEmail(value: string) {
  const [local = '', domain = ''] = value.split('@')
  if (!domain) {
    return value
  }
  const prefix = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2)
  return `${prefix}***@${domain}`
}

export function maskId(value: string) {
  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export function sanitizePayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item))
  }
  if (!value || typeof value !== 'object') {
    return value
  }

  const result: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase()
    if (normalizedKey.includes('email') && typeof raw === 'string') {
      result[key] = maskEmail(raw)
      continue
    }
    if (
      (normalizedKey === 'user_id' || normalizedKey === 'userid') &&
      typeof raw === 'string'
    ) {
      result[key] = maskId(raw)
      continue
    }
    result[key] = sanitizePayload(raw)
  }
  return result
}
