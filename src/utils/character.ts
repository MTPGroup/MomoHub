export function parseOptionalNumber(raw: string): number | undefined {
  const text = raw.trim()
  if (!text) {
    return undefined
  }
  const value = Number(text)
  if (!Number.isFinite(value)) {
    return Number.NaN
  }
  return value
}

export function buildGenerationParams(input: {
  temperature: string
  topP: string
  maxTokens: string
  presencePenalty: string
  frequencyPenalty: string
}): Record<string, unknown> | null {
  const temperature = parseOptionalNumber(input.temperature)
  const topP = parseOptionalNumber(input.topP)
  const maxTokens = parseOptionalNumber(input.maxTokens)
  const presencePenalty = parseOptionalNumber(input.presencePenalty)
  const frequencyPenalty = parseOptionalNumber(input.frequencyPenalty)

  if (
    Number.isNaN(temperature) ||
    Number.isNaN(topP) ||
    Number.isNaN(maxTokens) ||
    Number.isNaN(presencePenalty) ||
    Number.isNaN(frequencyPenalty)
  ) {
    return null
  }

  const next: Record<string, unknown> = {}
  if (temperature !== undefined) next.temperature = temperature
  if (topP !== undefined) next.topP = topP
  if (maxTokens !== undefined) next.maxTokens = maxTokens
  if (presencePenalty !== undefined) next.presencePenalty = presencePenalty
  if (frequencyPenalty !== undefined) next.frequencyPenalty = frequencyPenalty

  return next
}

export function extractLatestUserText(
  messages: Array<{ role: string; parts: unknown[] }>,
) {
  const latestUser = [...messages]
    .reverse()
    .find((item) => item.role === 'user')
  if (!latestUser) {
    return ''
  }
  return latestUser.parts
    .map((part) => {
      if (!part || typeof part !== 'object') return ''
      const candidate = part as { type?: string; text?: string }
      if (candidate.type === 'text' && typeof candidate.text === 'string') {
        return candidate.text
      }
      return ''
    })
    .join('')
}

export function extractMessageText(parts: unknown[]) {
  return parts
    .map((part) => {
      if (!part || typeof part !== 'object') return ''
      const candidate = part as { type?: string; text?: string }
      if (candidate.type === 'text' && typeof candidate.text === 'string') {
        return candidate.text
      }
      return ''
    })
    .join('')
}

export function getChatRuntimeConfig(input: {
  generationParams: Record<string, unknown>
}) {
  const hasGenerationParams = Object.keys(input.generationParams).length > 0
  return {
    settings: {
      generationParams: hasGenerationParams ? input.generationParams : null,
    },
  }
}

export function getConfigSignature(config: Record<string, unknown>) {
  return JSON.stringify(config)
}

export function openAiSseToTextStream(
  stream: ReadableStream<Uint8Array<ArrayBufferLike>>,
): ReadableStream<Uint8Array<ArrayBufferLike>> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  const getRunId = (payload: Record<string, unknown>): string | null => {
    const topLevelRunId = payload.run_id
    if (typeof topLevelRunId === 'string' && topLevelRunId) {
      return topLevelRunId
    }

    const nestedData = payload.data
    if (!nestedData || typeof nestedData !== 'object') {
      return null
    }

    const nestedRunId = (nestedData as { run_id?: unknown }).run_id
    return typeof nestedRunId === 'string' && nestedRunId ? nestedRunId : null
  }

  return new ReadableStream<Uint8Array<ArrayBufferLike>>({
    async start(controller) {
      const reader = stream.getReader()
      let buffer = ''
      let activeRunId: string | null = null
      let isDone = false

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          if (isDone) {
            continue
          }

          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() ?? ''

          for (const event of events) {
            const lines = event
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.startsWith('data:'))

            for (const line of lines) {
              const payload = line.slice(5).trim()
              if (!payload) {
                continue
              }

              if (payload === '[DONE]') {
                isDone = true
                continue
              }

              try {
                const json = JSON.parse(payload) as Record<string, unknown> & {
                  choices?: Array<{
                    delta?: { content?: string | null }
                    message?: { content?: string | null }
                  }>
                }

                const runId = getRunId(json)
                if (runId && !activeRunId) {
                  activeRunId = runId
                }
                if (activeRunId && runId && runId !== activeRunId) {
                  continue
                }

                const text =
                  json.choices?.[0]?.delta?.content ??
                  json.choices?.[0]?.message?.content ??
                  ''

                if (text) {
                  controller.enqueue(encoder.encode(text))
                }
              } catch {
                // 忽略非 JSON 或不符合约定的行，避免把历史/调试信息误拼接进消息气泡。
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
        controller.close()
      }
    },
  })
}

export function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'C'
}

export function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function parseBaseConfigFromText(raw: string) {
  const text = raw.trim()
  if (!text) {
    return undefined
  }
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}
