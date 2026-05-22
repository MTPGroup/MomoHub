import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { updateChat } from '#/client'
import type { AuthState } from '#/stores/auth'
import { getChatRuntimeConfig, getConfigSignature } from '#/utils/character'

export function useSessionParamSync({
  chatId,
  generationParams,
  auth,
}: {
  chatId: string
  generationParams: Record<string, unknown>
  auth: AuthState
}) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [appliedParams, setAppliedParams] = useState({})

  const lastSignatureRef = useRef('')

  const doSync = async (paramsToSync: Record<string, unknown>) => {
    if (!chatId || !auth.user) return
    const runtimeConfig = getChatRuntimeConfig({
      generationParams: paramsToSync,
    })
    const sig = getConfigSignature(runtimeConfig)

    if (sig === lastSignatureRef.current) {
      setHasPendingChanges(false)
      return
    }

    setIsSyncing(true)
    try {
      await updateChat({
        path: { id: chatId },
        body: runtimeConfig,
        throwOnError: true,
      })
      lastSignatureRef.current = sig
      setAppliedParams(paramsToSync)
      setHasPendingChanges(false)
    } finally {
      setIsSyncing(false)
    }
  }

  const debouncedSync = useDebounceCallback(doSync, 400)

  useEffect(() => {
    if (!chatId) return
    setHasPendingChanges(true)
    debouncedSync(generationParams)
  }, [generationParams, chatId, debouncedSync])

  const flushSync = useCallback(async () => {
    return debouncedSync.flush()
  }, [debouncedSync])

  const markPending = useCallback(() => setHasPendingChanges(true), [])
  const forceSetApplied = useCallback(
    (params: Record<string, unknown>, sig: string) => {
      setAppliedParams(params)
      lastSignatureRef.current = sig
      setHasPendingChanges(false)
    },
    [],
  )

  return {
    isSyncing,
    hasPendingChanges,
    appliedParams,
    flushSync,
    markPending,
    forceSetApplied,
  }
}
