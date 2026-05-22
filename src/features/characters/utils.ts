export function getCharacterStatusBadgeClassName(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  if (normalized.includes('active')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (normalized.includes('pending')) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  if (
    normalized.includes('banned') ||
    normalized.includes('deleted') ||
    normalized.includes('draft')
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}
