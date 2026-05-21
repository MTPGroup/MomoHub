import { useQuery } from '@tanstack/react-query'
import { getAuditLogsOptions } from '#/client/@tanstack/react-query.gen'
import type { AuditLogsData } from '../types'

export function useAuditLogs(enabled: boolean) {
  const auditLogsQuery = useQuery({
    ...getAuditLogsOptions(),
    enabled,
  })

  const auditData =
    (auditLogsQuery.data as { data?: AuditLogsData | null } | undefined)
      ?.data ?? null
  const auditItems = auditData?.items ?? []
  const auditTotal = auditData?.total ?? auditItems.length
  const auditPage = auditData?.page ?? 1
  const auditPageSize = auditData?.pageSize ?? 20
  const auditTotalPages = auditData?.totalPages ?? 1

  return {
    data: {
      auditItems,
      auditTotal,
      auditPage,
      auditPageSize,
      auditTotalPages,
    },
    state: {
      isLoading: auditLogsQuery.isPending,
    },
  }
}

export type AuditLogsState = ReturnType<typeof useAuditLogs>
