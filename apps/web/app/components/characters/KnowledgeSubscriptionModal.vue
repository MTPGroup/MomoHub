<script setup lang="ts">
import type {
  KnowledgeBaseResponse,
  KnowledgeSubscriptionResponse,
} from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const props = defineProps<{
  characterId: string
  characterName: string
}>()

const emit = defineEmits<{
  subscribed: []
  unsubscribed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const {
  listCharacterKnowledgeBases,
  subscribeKnowledgeBase,
  unsubscribeKnowledgeBase,
} = useCharacters()
const { listKnowledgeBases } = useKnowledge()
const toast = useToast()

// 已订阅的知识库
const subscribedKnowledgeBases = ref<KnowledgeSubscriptionResponse[]>([])
// 可用的知识库列表
const availableKnowledgeBases = ref<KnowledgeBaseResponse[]>([])
const loading = ref(true)
const subscribeLoading = ref(false)
const selectedKnowledgeBaseId = ref('')
const priority = ref(1)

// 获取已订阅的知识库
const fetchSubscribed = async () => {
  try {
    const response = await listCharacterKnowledgeBases(props.characterId)
    if (response.success && response.data) {
      subscribedKnowledgeBases.value = response.data
    }
  } catch (e) {
    console.error('获取订阅知识库失败:', e)
  }
}

// 获取可用知识库
const fetchAvailable = async () => {
  try {
    const myResponse = await listKnowledgeBases({ limit: 100 })
    if (myResponse.success && myResponse.data) {
      const myKbs = (myResponse.data as { items: KnowledgeBaseResponse[] })
        .items
      availableKnowledgeBases.value = myKbs
    }
  } catch (e) {
    console.error('获取可用知识库失败:', e)
  }
}

// 获取知识库名称
const getKnowledgeBaseName = (id: string) => {
  const kb = availableKnowledgeBases.value.find((k) => k.id === id)
  return kb?.name || id
}

// 订阅知识库
const handleSubscribe = async () => {
  if (!selectedKnowledgeBaseId.value) {
    toast.add({
      title: '请选择要订阅的知识库',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  subscribeLoading.value = true
  try {
    const response = await subscribeKnowledgeBase(props.characterId, {
      knowledgeBaseId: selectedKnowledgeBaseId.value,
      priority: priority.value,
    })
    if (response.success) {
      toast.add({
        title: '订阅成功',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
      await fetchSubscribed()
      selectedKnowledgeBaseId.value = ''
      priority.value = 1
      emit('subscribed')
    } else {
      toast.add({
        title: response.message || '订阅失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '订阅失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    subscribeLoading.value = false
  }
}

// 取消订阅
const handleUnsubscribe = async (knowledgeBaseId: string) => {
  try {
    const response = await unsubscribeKnowledgeBase(
      props.characterId,
      knowledgeBaseId,
    )
    if (response.success) {
      toast.add({
        title: '已取消订阅',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
      await fetchSubscribed()
      emit('unsubscribed')
    } else {
      toast.add({
        title: response.message || '取消订阅失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '取消订阅失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

// 可选的知识库（排除已订阅的）
const selectableKnowledgeBases = computed(() => {
  const subscribedIds = subscribedKnowledgeBases.value.map(
    (s) => s.knowledgeBaseId,
  )
  return availableKnowledgeBases.value.filter(
    (kb) => !subscribedIds.includes(kb.id),
  )
})

// 监听 Modal 打开状态
watch(open, (val) => {
  if (val) {
    loading.value = true
    Promise.all([fetchSubscribed(), fetchAvailable()]).finally(() => {
      loading.value = false
    })
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="管理知识库订阅"
    description="为角色订阅知识库以提供上下文支持"
  >
    <template #content>
      <div class="p-6">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold">管理知识库订阅</h2>
          <p class="text-sm text-gray-500 mt-1">
            为「{{ characterName }}」订阅知识库
          </p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="space-y-3">
          <USkeleton class="h-12 w-full" />
          <USkeleton class="h-12 w-full" />
        </div>

        <div v-else class="space-y-6">
          <!-- 已订阅的知识库列表 -->
          <div v-if="subscribedKnowledgeBases.length > 0" class="space-y-3">
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
              已订阅的知识库
            </h4>
            <div
              v-for="sub in subscribedKnowledgeBases"
              :key="sub.knowledgeBaseId"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-book-open" class="text-gray-400" />
                <div>
                  <p class="font-medium">
                    {{ getKnowledgeBaseName(sub.knowledgeBaseId) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    优先级: {{ sub.priority }}
                  </p>
                </div>
              </div>
              <UButton
                color="error"
                variant="ghost"
                size="xs"
                icon="i-lucide-trash-2"
                @click="handleUnsubscribe(sub.knowledgeBaseId)"
              >
                取消订阅
              </UButton>
            </div>
          </div>

          <div
            v-else
            class="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <UIcon
              name="i-lucide-book-open"
              class="text-3xl text-gray-300 mx-auto mb-2"
            />
            <p class="text-sm">暂无订阅的知识库</p>
          </div>

          <!-- 添加订阅 -->
          <div
            v-if="selectableKnowledgeBases.length > 0"
            class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3"
          >
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
              添加订阅
            </h4>
            <div class="flex gap-3">
              <USelect
                v-model="selectedKnowledgeBaseId"
                :items="
                  selectableKnowledgeBases.map((kb) => ({
                    label: kb.name,
                    value: kb.id,
                  }))
                "
                placeholder="选择知识库"
                class="flex-1"
              />
              <UInput
                v-model.number="priority"
                type="number"
                placeholder="优先级"
                class="w-24"
                min="1"
                max="10"
              />
              <UButton
                color="primary"
                icon="i-lucide-plus"
                :loading="subscribeLoading"
                @click="handleSubscribe"
              >
                订阅
              </UButton>
            </div>
            <p class="text-xs text-gray-500">优先级数字越小越重要，范围 1-10</p>
          </div>

          <div
            v-else-if="availableKnowledgeBases.length > 0"
            class="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-500"
          >
            所有知识库已订阅
          </div>

          <div
            v-else
            class="border-t border-gray-200 dark:border-gray-700 pt-4 text-center"
          >
            <p class="text-sm text-gray-500 mb-2">还没有可用的知识库</p>
            <UButton to="/knowledge/create" size="xs" icon="i-lucide-plus">
              创建知识库
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
