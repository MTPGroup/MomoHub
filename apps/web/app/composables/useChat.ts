import type {
  ChatConfigResponse,
  ChatResponse,
  CreateChatRequest,
  MessageResponse,
  SendMessageRequest,
  UpdateChatConfigRequest,
  UpdateChatNameRequest,
} from '@momohub/types'

export const useChat = () => {
  const { api } = useAzusaApi()

  // 创建聊天会话
  const createChat = async (data: CreateChatRequest) => {
    return api<ChatResponse>('/chats', {
      method: 'POST',
      body: data,
    })
  }

  // 获取聊天列表
  const listChats = async (params?: { page?: number; limit?: number }) => {
    return api<{ items: ChatResponse[]; total: number }>('/chats', {
      params,
    })
  }

  // 获取聊天详情
  const getChat = async (chatId: string) => {
    return api<ChatResponse>(`/chats/${chatId}`)
  }

  // 更新聊天名称
  const updateChatName = async (
    chatId: string,
    data: UpdateChatNameRequest,
  ) => {
    return api<ChatResponse>(`/chats/${chatId}/name`, {
      method: 'PUT',
      body: data,
    })
  }

  // 删除聊天
  const deleteChat = async (chatId: string) => {
    return api<undefined>(`/chats/${chatId}`, {
      method: 'DELETE',
    })
  }

  // 获取历史消息
  const listMessages = async (
    chatId: string,
    params?: { page?: number; limit?: number },
  ) => {
    return api<{
      items: MessageResponse[]
      total: number
      hasMore: boolean
    }>(`/chats/${chatId}/messages`, {
      params,
    })
  }

  // 清空历史消息
  const clearMessages = async (chatId: string) => {
    return api<undefined>(`/chats/${chatId}/messages`)
  }

  // 发送消息（支持流式响应）
  const sendMessage = async (
    chatId: string,
    data: SendMessageRequest,
    onChunk?: (chunk: string) => void,
  ) => {
    // 如果不支持流式回调，使用普通请求
    if (!onChunk) {
      return api<MessageResponse>(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: {
          content: data,
        },
      })
    }

    // 流式响应处理
    try {
      const config = useRuntimeConfig()
      const accessToken = useCookie('auth_access_token')

      const response = await fetch(
        `${config.public.apiBaseUrl}/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken.value}`,
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(data),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: error.message || '发送消息失败',
        }
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        return {
          success: false,
          message: '无法读取响应',
        }
      }

      let fullContent = ''
      let currentEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (currentEvent === 'done') {
              // 完成事件：data 是完整文本
              reader.releaseLock()
              return {
                success: true,
                data: {
                  id: Date.now().toString(),
                  senderType: 'AI',
                  content: { type: 'TEXT', text: fullContent || data },
                  createdAt: new Date().toISOString(),
                } as MessageResponse,
              }
            } else if (data === '[DONE]') {
              // 兼容标准 SSE 格式
              reader.releaseLock()
              return {
                success: true,
                data: {
                  id: Date.now().toString(),
                  senderType: 'AI',
                  content: { type: 'TEXT', text: fullContent },
                  createdAt: new Date().toISOString(),
                } as MessageResponse,
              }
            } else {
              // delta 事件：data 是 JSON，包含增量内容
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  onChunk(parsed.content)
                }
              } catch {
                // 不是 JSON，可能是纯文本增量
                if (currentEvent === 'delta') {
                  fullContent += data
                  onChunk(data)
                }
              }
            }
          } else if (line === '') {
            // 空行，重置事件类型
            currentEvent = ''
          }
        }
      }

      reader.releaseLock()
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          senderType: 'AI',
          content: { type: 'TEXT', text: fullContent },
          createdAt: new Date().toISOString(),
        } as MessageResponse,
      }
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : '发送消息失败',
      }
    }
  }

  // 获取聊天配置
  const getChatConfig = async (chatId: string) => {
    return api<ChatConfigResponse>(`/chats/${chatId}/config`)
  }

  // 更新聊天配置
  const updateChatConfig = async (
    chatId: string,
    data: UpdateChatConfigRequest,
  ) => {
    return api<ChatConfigResponse>(`/chats/${chatId}/config`, {
      method: 'PUT',
      body: data,
    })
  }

  // 创建临时测试聊天
  const createTestChat = async (characterId: string) => {
    return api<ChatResponse>('/chats', {
      method: 'POST',
      body: { characterId, temporary: true },
    })
  }

  return {
    createChat,
    listChats,
    getChat,
    updateChatName,
    deleteChat,
    listMessages,
    sendMessage,
    clearMessages,
    getChatConfig,
    updateChatConfig,
    createTestChat,
  }
}
