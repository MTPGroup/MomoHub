import { useCallback, useRef, useState } from 'react'

export function useTempChatSession() {
  const [tempChatId, setTempChatId] = useState('')
  const [tempChatExpiresAt, setTempChatExpiresAt] = useState('')
  const tempChatIdRef = useRef('')

  const setSession = useCallback((id: string, expiresAt: string) => {
    setTempChatId(id)
    tempChatIdRef.current = id
    setTempChatExpiresAt(expiresAt)
  }, [])

  const clearSession = useCallback(() => {
    setTempChatId('')
    tempChatIdRef.current = ''
    setTempChatExpiresAt('')
  }, [])

  return {
    tempChatId,
    tempChatExpiresAt,
    tempChatIdRef,
    setSession,
    clearSession,
  }
}
