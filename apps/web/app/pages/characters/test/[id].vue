<script setup lang="ts">
import type {
  CharacterResponse,
  ChatConfigResponse,
  MessageResponse,
} from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const route = useRoute()
const router = useRouter()
const characterId = route.params.id as string

const { getCharacter, listCharacterKnowledgeBases } = useCharacters()
const { listKnowledgeBases } = useKnowledge()
const { createTestChat, sendMessage, clearMessages, updateChatConfig } =
  useChat()
const authStore = useAuthStore()
const toast = useToast()

const character = ref<CharacterResponse | null>(null)
const knowledgeBases = ref<{ id: string; name: string }[]>([])
const chatId = ref<string | null>(null)

const chatConfig = reactive<ChatConfigResponse>({
  temperature: 0.7,
  maxTokens: 23768,
  topP: 1,
  systemPrompt: '',
})

const messages = ref<MessageResponse[]>([])
const inputMessage = ref('')
const sending = ref(false)
const isStreaming = ref(false)
const streamingContent = ref('')
const loading = ref(true)
const showSidebar = ref(false)
const savingConfig = ref(false)

const uiMessages = computed(() => {
  return messages.value.map((m) => {
    let textContent = ''
    if (typeof m.content === 'string') {
      textContent = m.content
    } else if (Array.isArray(m.content)) {
      textContent = m.content.find((c) => c.type === 'text')?.content || ''
    } else if (typeof m.content === 'object' && m.content !== null) {
      textContent = (m.content as any).text || (m.content as any).content || ''
    }

    return {
      id: m.id,
      role: m.senderType === 'USER' ? 'user' : 'assistant',
      parts: [
        {
          type: 'text' as const,
          text: textContent,
        },
      ],
    }
  })
})

const chatStatus = computed(() => {
  if (!sending.value) return undefined
  return isStreaming.value ? 'streaming' : 'submitted'
})

const loadData = async () => {
  try {
    const [charResponse, kbResponse] = await Promise.all([
      getCharacter(characterId),
      listCharacterKnowledgeBases(characterId),
    ])

    if (charResponse.success && charResponse.data) {
      character.value = charResponse.data
    } else {
      toast.add({
        title: '角色不存在',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
      router.push('/characters')
      return
    }

    if (kbResponse.success && kbResponse.data) {
      const allKbResponse = await listKnowledgeBases({ limit: 100 })
      if (allKbResponse.success && allKbResponse.data) {
        const allKbs = (
          allKbResponse.data as { items: { id: string; name: string }[] }
        ).items
        knowledgeBases.value = kbResponse.data.map((sub) => {
          const kb = allKbs.find((k) => k.id === sub.knowledgeBaseId)
          return {
            id: sub.knowledgeBaseId,
            name: kb?.name || '未知知识库',
          }
        })
      }
    }

    const testChatResponse = await createTestChat(characterId)
    if (testChatResponse.success && testChatResponse.data) {
      chatId.value = testChatResponse.data.id
      await updateChatConfig(chatId.value, {
        temperature: chatConfig.temperature,
        maxTokens: chatConfig.maxTokens,
        topP: chatConfig.topP,
        systemPrompt: chatConfig.systemPrompt,
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '加载失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    loading.value = false
  }
}

const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value || !chatId.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  messages.value.push({
    id: Date.now().toString(),
    senderType: 'USER',
    content: { type: 'TEXT', text: userMessage },
    createdAt: new Date().toISOString(),
  } as unknown as MessageResponse)

  sending.value = true
  streamingContent.value = ''
  let aiMessagePushed = false

  try {
    const response = await sendMessage(
      chatId.value,
      {
        content: [
          {
            type: 'TEXT',
            content: userMessage,
          },
        ],
      },
      (chunk) => {
        if (!isStreaming.value) {
          isStreaming.value = true
        }
        streamingContent.value += chunk

        // 第一次收到 chunk 时，动态添加 AI 占位消息
        if (!aiMessagePushed) {
          aiMessagePushed = true
          messages.value.push({
            id: Date.now().toString(),
            senderType: 'CHARACTER',
            content: { type: 'TEXT', text: streamingContent.value },
            createdAt: new Date().toISOString(),
          } as unknown as MessageResponse)
        } else {
          // 更新最后一条 AI 消息的内容
          const lastIndex = messages.value.length - 1
          const lastMsg = messages.value[lastIndex]
          if (lastMsg?.senderType === 'CHARACTER') {
            messages.value[lastIndex] = {
              ...lastMsg,
              content: {
                type: 'TEXT',
                text: streamingContent.value,
              },
            }
          }
        }
      },
    )

    if (!response.success) {
      if (aiMessagePushed) {
        messages.value.pop()
      }
      messages.value.pop()
      toast.add({ title: '发送失败', color: 'error' })
    } else if (response.data) {
      if (aiMessagePushed) {
        messages.value[messages.value.length - 1] = response.data
      } else {
        messages.value.push(response.data)
      }
    }
  } catch (e) {
    if (aiMessagePushed) {
      messages.value.pop()
    }
    messages.value.pop()
  } finally {
    sending.value = false
    isStreaming.value = false
  }
}

const clearChat = () => {
  if (confirm('确定要清空测试对话吗？')) {
    messages.value = []
    if (chatId.value) clearMessages(chatId.value)
  }
}

const applyConfig = async () => {
  if (!chatId.value) return

  try {
    await updateChatConfig(chatId.value, {
      temperature: chatConfig.temperature,
      maxTokens: chatConfig.maxTokens,
      topP: chatConfig.topP,
      systemPrompt: chatConfig.systemPrompt,
    })

    toast.add({
      title: '配置已更新',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '更新配置失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

const resetConfig = () => {
  if (character.value) {
    chatConfig.systemPrompt = character.value.originPrompt || ''
  }
  chatConfig.temperature = 0.7
  chatConfig.maxTokens = 2048
  chatConfig.topP = 1
}

const exportConversation = () => {
  const data = {
    character: character.value?.name,
    config: chatConfig,
    messages: messages.value.map((m) => ({
      role: m.senderType === 'USER' ? 'user' : 'assistant',
      content: (m.content as { text: string }).text,
      timestamp: m.createdAt,
    })),
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-${character.value?.name}-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast.add({
    title: '对话已导出',
    color: 'success',
    icon: 'i-lucide-check-circle',
  })
}

// watch(
//   () => messages.value,
//   (newVal) => {
//     console.log('=== messages 变化 ===', newVal.length, '条消息')
//     newVal.forEach((m, i) => {
//       console.log(
//         `消息 ${i}:`,
//         m.id,
//         m.senderType,
//         typeof m.content === 'object'
//           ? (m.content as any).text?.substring(0, 30)
//           : m.content,
//       )
//     })
//   },
//   { deep: true },
// )

onMounted(loadData)
</script>

<template>
  <UContainer class="h-[calc(100vh-4rem)] py-2 sm:py-4 px-2 sm:px-4" fluid>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <div class="text-center">
        <ULoadingIcon size="lg" />
        <p class="mt-4 text-gray-500">加载角色...</p>
      </div>
    </div>

    <div v-else-if="character" class="h-full flex gap-2 sm:gap-4">
      <!-- 移动端侧边栏遮罩 -->
      <div
        v-if="showSidebar"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="showSidebar = false"
      />

      <!-- 侧边栏 -->
      <div
        :class="[
          'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 z-50',
          'fixed lg:static inset-y-2 left-2 lg:inset-auto',
          showSidebar
            ? 'w-80 opacity-100'
            : 'w-0 opacity-0 lg:opacity-100 overflow-hidden',
        ]"
      >
        <div class="h-full flex flex-col">
          <div class="p-4 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">测试配置</h2>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-x"
                @click="showSidebar = false"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <div class="flex items-center gap-3">
              <UAvatar
                :src="character.avatar || undefined"
                :text="character.name?.[0]"
                size="lg"
              />
              <div>
                <p class="font-medium">{{ character.name }}</p>
                <p class="text-xs text-gray-500">角色测试模式</p>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">系统提示词</label>
              <UTextarea
                v-model="chatConfig.systemPrompt"
                :rows="6"
                placeholder="输入系统提示词..."
                class="w-full text-sm"
              />
            </div>

            <div class="space-y-4">
              <h3 class="text-sm font-medium">模型参数</h3>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Temperature</span>
                  <span class="text-gray-500">{{
                    chatConfig.temperature
                  }}</span>
                </div>
                <URange
                  v-model="chatConfig.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">创造性 (越高越有创意)</p>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Max Tokens</span>
                  <span class="text-gray-500">{{ chatConfig.maxTokens }}</span>
                </div>
                <URange
                  v-model="chatConfig.maxTokens"
                  :min="256"
                  :max="4096"
                  :step="256"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">最大回复长度</p>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Top P</span>
                  <span class="text-gray-500">{{ chatConfig.topP }}</span>
                </div>
                <URange
                  v-model="chatConfig.topP"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">采样多样性</p>
              </div>
            </div>

            <div v-if="knowledgeBases.length > 0">
              <h3 class="text-sm font-medium mb-2">已订阅知识库</h3>
              <div class="space-y-1">
                <div
                  v-for="kb in knowledgeBases"
                  :key="kb.id"
                  class="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <UIcon name="i-lucide-book-open" class="text-gray-400" />
                  <span>{{ kb.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2"
          >
            <UButton block size="sm" icon="i-lucide-check" @click="applyConfig">
              应用配置
            </UButton>
            <UButton
              block
              size="sm"
              variant="ghost"
              color="neutral"
              icon="i-lucide-rotate-ccw"
              @click="resetConfig"
            >
              重置默认
            </UButton>
          </div>
        </div>
      </div>

      <div
        class="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200 dark:border-gray-800"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-arrow-left"
              class="shrink-0"
              :to="`/characters/${characterId}`"
            >
              <span class="hidden sm:inline">返回</span>
            </UButton>
            <div
              class="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0"
            ></div>
            <div class="flex items-center gap-2 min-w-0">
              <UAvatar
                :src="character.avatar || undefined"
                :text="character.name?.[0]"
                size="sm"
                class="shrink-0"
              />
              <span class="font-medium truncate">{{ character.name }}</span>
              <UBadge
                size="xs"
                color="warning"
                variant="subtle"
                class="shrink-0 inline-flex"
                >测试</UBadge
              >
            </div>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <UButton
              v-if="!showSidebar"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-settings"
              class="shrink-0"
              @click="showSidebar = true"
            >
              <span class="hidden sm:inline">配置</span>
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-download"
              class="shrink-0"
              :disabled="messages.length === 0"
              @click="exportConversation"
            >
              <span class="hidden sm:inline">导出</span>
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-trash"
              class="shrink-0"
              :disabled="messages.length === 0"
              @click="clearChat"
            >
              <span class="hidden sm:inline">清空</span>
            </UButton>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2 sm:p-4">
          <div
            v-if="messages.length === 0"
            class="text-center py-8 sm:py-12 px-4"
          >
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-bot"
                class="text-xl sm:text-2xl text-primary-600"
              />
            </div>
            <h3 class="text-base sm:text-lg font-medium mb-2">开始测试对话</h3>
            <p class="text-sm text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 px-4">
              这是角色测试模式，你可以调整系统提示词和参数，实时预览角色效果。
            </p>
            <div class="flex gap-2 justify-center">
              <UButton
                v-if="!showSidebar"
                size="sm"
                variant="outline"
                icon="i-lucide-settings"
                @click="showSidebar = true"
              >
                打开配置面板
              </UButton>
            </div>
          </div>
          <UChatMessages
            v-else
            :messages="uiMessages"
            :status="chatStatus"
            :assistant="{
              variant: 'soft',
              avatar: character.avatar
                ? { src: character.avatar }
                : { text: character.name?.[0] || 'A' },
            }"
            :user="{
              variant: 'soft',
              avatar: authStore.user?.avatar
                ? { src: authStore.user.avatar }
                : { text: authStore.user?.username?.[0] || 'U' },
            }"
            should-auto-scroll
            class="h-full"
          >
            <template #content="{ message }">
              <template
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${part.type}-${index}`"
              >
                <MDC
                  v-if="part.type === 'text' && message.role === 'assistant'"
                  :value="part.text"
                  :cache-key="`${message.id}-${index}`"
                  class="*:first:mt-0 *:last:mb-0"
                />
                <p
                  v-else-if="part.type === 'text' && message.role === 'user'"
                  class="whitespace-pre-wrap"
                >
                  {{ part.text }}
                </p>
              </template>
            </template>
          </UChatMessages>
        </div>

        <div class="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-800">
          <div class="flex gap-2 items-stretch">
            <UTextarea
              v-model="inputMessage"
              placeholder="输入消息..."
              :rows="1"
              :max-rows="4"
              class="flex-1 resize-none min-h-10"
              @keydown="
                (e: KeyboardEvent) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }
              "
            />

            <UButton
              color="primary"
              icon="i-lucide-send"
              :loading="sending"
              :disabled="!inputMessage.trim()"
              class="shrink-0"
              @click="handleSendMessage"
            >
              <span class="hidden sm:inline">发送</span>
            </UButton>
          </div>
          <p class="text-xs text-gray-500 mt-2 hidden sm:block">
            按 Enter 发送，Shift + Enter 换行 · 测试对话不会保存
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
