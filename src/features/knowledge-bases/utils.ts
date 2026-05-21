export function normalizeDocumentStatus(status?: string | null) {
  return status?.toLowerCase() ?? ''
}

export function isDocumentSuccess(status: string) {
  return (
    status.includes('success') ||
    status.includes('done') ||
    status.includes('completed')
  )
}

export function isDocumentFailed(status: string) {
  return (
    status.includes('fail') ||
    status.includes('error') ||
    status.includes('rejected')
  )
}

export function isDocumentProcessing(status: string) {
  return (
    status.includes('processing') ||
    status.includes('pending') ||
    status.includes('queued') ||
    status.includes('running')
  )
}

export function canRetryDocument(status: string) {
  return isDocumentFailed(normalizeDocumentStatus(status))
}

export function getDocumentStatusBadgeClassName(status: string) {
  const normalized = normalizeDocumentStatus(status)
  if (isDocumentSuccess(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (isDocumentFailed(normalized)) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (isDocumentProcessing(normalized)) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

export function formatBytes(bytes?: number | null) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return '-'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(decimals)} ${units[unitIndex]}`
}

export function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'K'
}

export function getKbStatusBadgeClassName(status?: string | null) {
  const normalized = status?.toLowerCase() ?? ''
  if (
    normalized.includes('ready') ||
    normalized.includes('active') ||
    normalized.includes('ok')
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (
    normalized.includes('error') ||
    normalized.includes('fail') ||
    normalized.includes('rejected')
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (
    normalized.includes('building') ||
    normalized.includes('processing') ||
    normalized.includes('pending')
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}
