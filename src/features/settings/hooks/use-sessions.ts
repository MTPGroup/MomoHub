import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteAllSessionsMutation,
  deleteSessionMutation,
  listSessionsOptions,
  listSessionsQueryKey,
} from '#/client/@tanstack/react-query.gen'
import type { SessionItem } from '../types'

export function useSessions(enabled: boolean) {
  const queryClient = useQueryClient()

  const sessionsQuery = useQuery({
    ...listSessionsOptions(),
    enabled,
  })

  const sessions =
    (sessionsQuery.data as { data?: SessionItem[] | null } | undefined)?.data ??
    []

  const deleteSession = useMutation({
    ...deleteSessionMutation(),
    onSuccess: () => {
      toast.success('设备会话已下线')
      queryClient.invalidateQueries({
        queryKey: listSessionsQueryKey(),
      })
    },
    onError: (error) => {
      toast.error('操作失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const handleDeleteSession = (sessionId: string) => {
    deleteSession.mutate({
      path: { session_id: sessionId },
    })
  }

  const deleteAllSessions = useMutation({
    ...deleteAllSessionsMutation(),
    onSuccess: () => {
      toast.success('其他设备已全部下线')
      queryClient.invalidateQueries({
        queryKey: listSessionsQueryKey(),
      })
    },
  })

  const handleDeleteAllSessions = () => deleteAllSessions.mutate({})

  return {
    data: {
      sessions,
    },
    actions: {
      deleteSession: handleDeleteSession,
      deleteAllSessions: handleDeleteAllSessions,
    },
  }
}

export type SessionsState = ReturnType<typeof useSessions>
