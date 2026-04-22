type ImportedMessage = {
  id?: string | null
  role: string
  content?: string | null
  parts?: Array<{ [key: string]: unknown }>
}

export type ImportedChatPayload = {
  version?: string
  chat?: {
    characterId: string
    title?: string | null
    contextWindow?: number
    llmConfigId?: string | null
    isTemporary?: boolean
    expiresAt?: string | null
    settings?: { generationParams?: Record<string, unknown> | null }
  }
  messages?: ImportedMessage[]
}

export function parseImportedChatPayload(raw: string): ImportedChatPayload {
  return JSON.parse(raw) as ImportedChatPayload
}

export function mapImportedMessagesToUiMessages(messages: ImportedMessage[]) {
  return messages.map((item, index) => {
    const partText = (item.parts ?? [])
      .map((part) => {
        if (!part || typeof part !== 'object') return ''
        const candidate = part as { type?: string; text?: string }
        if (candidate.type === 'text' && typeof candidate.text === 'string') {
          return candidate.text
        }
        return ''
      })
      .join('')

    return {
      id: item.id ?? `imported-${index}`,
      role: item.role as 'user' | 'assistant' | 'system',
      parts: [
        {
          type: 'text' as const,
          text: partText || item.content || '',
        },
      ],
    }
  })
}
