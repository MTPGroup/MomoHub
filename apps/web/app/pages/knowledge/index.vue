<script setup lang="ts">
import type { KnowledgeBaseResponse, PagedResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const { listPublicKnowledgeBases, listKnowledgeBases, searchKnowledgeBases } =
  useKnowledge()
const authStore = useAuthStore()

const searchQuery = ref('')
const page = ref(1)
const limit = 12

const knowledgeBases = ref<KnowledgeBaseResponse[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')

// 已登录时，用户自己的私有知识库（单独抓取，不影响分页）
const ownPrivateKnowledgeBases = ref<KnowledgeBaseResponse[]>([])

// 搜索时后端已合并私有结果，浏览模式才需单独展示私有区块
const filteredPrivateKnowledgeBases = computed(() =>
  searchQuery.value ? [] : ownPrivateKnowledgeBases.value,
)

const fetchOwnPrivateKnowledgeBases = async () => {
  if (!authStore.isLoggedIn) {
    ownPrivateKnowledgeBases.value = []
    return
  }
  try {
    const response = await listKnowledgeBases({ limit: 100 })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<KnowledgeBaseResponse>
      ownPrivateKnowledgeBases.value = data.items.filter((kb) => !kb.isPublic)
    }
  } catch {
    // 静默失败，不影响主列表
  }
}

let loadingTimer: ReturnType<typeof setTimeout> | null = null

const showLoadingWithDelay = () => {
  // 延迟显示骨架屏，避免快速加载时闪烁
  loadingTimer = setTimeout(() => {
    loading.value = true
  }, 200)
}

const hideLoading = () => {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loading.value = false
}

const fetchData = async () => {
  showLoadingWithDelay()
  error.value = ''

  try {
    const response = searchQuery.value
      ? await searchKnowledgeBases({
          q: searchQuery.value,
          page: page.value,
          limit,
        })
      : await listPublicKnowledgeBases({
          page: page.value,
          limit,
        })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<KnowledgeBaseResponse>
      knowledgeBases.value = data.items
      total.value = data.total
      totalPages.value = data.totalPages
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载知识库列表失败')
  } finally {
    hideLoading()
  }
}

watch(page, fetchData)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newQuery, oldQuery) => {
  clearTimeout(searchTimeout)

  // 如果是清除搜索（从有到无），立即加载，不要延迟
  if (oldQuery && !newQuery) {
    page.value = 1
    fetchData()
    return
  }

  // 其他情况（输入搜索词）使用防抖
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchData()
  }, 300)
})

// 登录状态变化时重新获取私有知识库
watch(() => authStore.isLoggedIn, fetchOwnPrivateKnowledgeBases)

onMounted(() => {
  Promise.all([fetchOwnPrivateKnowledgeBases(), fetchData()])
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        知识库
      </h1>
      <p class="text-gray-600 dark:text-gray-400">探索和管理知识库资源</p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="搜索知识库..."
        class="flex-1"
      />
      <UButton to="/knowledge/create" color="primary" icon="i-lucide-plus">
        创建知识库
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <!-- 我的私有知识库（登录后才显示） -->
    <template v-if="filteredPrivateKnowledgeBases.length > 0">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-lock" class="text-amber-500" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          我的私有知识库
        </span>
        <UBadge color="warning" variant="subtle" size="xs">
          {{ filteredPrivateKnowledgeBases.length }}
        </UBadge>
      </div>
      <KnowledgeList
        :knowledge-bases="filteredPrivateKnowledgeBases"
        class="mb-8"
      />
      <UDivider
        v-if="!loading && knowledgeBases.length > 0"
        label="公开知识库"
        class="mb-6"
      />
    </template>

    <!-- 初始加载状态 - 骨架屏 -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <UCard v-for="i in 8" :key="i">
        <div class="flex items-start gap-4">
          <USkeleton class="h-12 w-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-full" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- 知识库列表 -->
    <div v-else-if="knowledgeBases.length > 0">
      <KnowledgeList :knowledge-bases="knowledgeBases" />

      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <UPagination v-model="page" :total="total" :items-per-page="limit" />
      </div>
    </div>

    <!-- 空状态（公开列表为空且无私有知识库） -->
    <div
      v-else-if="!loading && filteredPrivateKnowledgeBases.length === 0"
      class="text-center py-16"
    >
      <UIcon
        :name="searchQuery ? 'i-lucide-search-x' : 'i-lucide-book-open'"
        class="text-6xl text-gray-300 mx-auto mb-4"
      />
      <p class="text-gray-500 text-lg">
        {{ searchQuery ? '没有找到匹配的知识库' : '还没有知识库' }}
      </p>
      <UButton
        v-if="searchQuery"
        variant="ghost"
        class="mt-4"
        @click="searchQuery = ''"
      >
        清除搜索
      </UButton>
      <UButton
        v-else
        to="/knowledge/create"
        color="primary"
        class="mt-4"
        icon="i-lucide-plus"
      >
        创建第一个知识库
      </UButton>
    </div>
  </UContainer>
</template>
