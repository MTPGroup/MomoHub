<script setup lang="ts">
import type { CharacterResponse, PagedResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const { listPublicCharacters, listCharacters, searchCharacters } =
  useCharacters()
const authStore = useAuthStore()

const searchQuery = ref('')
const page = ref(1)
const limit = 12

const characters = ref<CharacterResponse[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')

// 已登录时，用户自己的私有角色（单独抓取，不影响分页）
const ownPrivateCharacters = ref<CharacterResponse[]>([])

// 搜索时后端已合并私有结果，浏览模式才需单独展示私有区块
const filteredPrivateCharacters = computed(() =>
  searchQuery.value ? [] : ownPrivateCharacters.value,
)

const fetchOwnPrivateCharacters = async () => {
  if (!authStore.isLoggedIn) {
    ownPrivateCharacters.value = []
    return
  }
  try {
    const response = await listCharacters({ limit: 100 })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<CharacterResponse>
      ownPrivateCharacters.value = data.items.filter((c) => !c.isPublic)
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

const fetchCharacters = async () => {
  showLoadingWithDelay()
  error.value = ''

  try {
    const response = searchQuery.value
      ? await searchCharacters({
          q: searchQuery.value,
          page: page.value,
          limit,
        })
      : await listPublicCharacters({
          page: page.value,
          limit,
        })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<CharacterResponse>
      characters.value = data.items
      total.value = data.total
      totalPages.value = data.totalPages
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载角色列表失败')
  } finally {
    hideLoading()
  }
}

watch(page, fetchCharacters)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newQuery, oldQuery) => {
  clearTimeout(searchTimeout)

  // 如果是清除搜索（从有到无），立即加载，不要延迟
  if (oldQuery && !newQuery) {
    page.value = 1
    fetchCharacters()
    return
  }

  // 其他情况（输入搜索词）使用防抖
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchCharacters()
  }, 300)
})

// 登录状态变化时重新获取私有角色
watch(() => authStore.isLoggedIn, fetchOwnPrivateCharacters)

onMounted(() => {
  Promise.all([fetchOwnPrivateCharacters(), fetchCharacters()])
})
</script>

<template>
  <UContainer class="py-8">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        角色列表
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        发现和探索社区创建的 AI 角色
      </p>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="搜索角色..."
        class="flex-1"
      />
      <UButton to="/characters/create" color="primary" icon="i-lucide-plus">
        创建角色
      </UButton>
    </div>

    <!-- 错误提示 -->
    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <!-- 我的私有角色（登录后才显示） -->
    <template v-if="filteredPrivateCharacters.length > 0">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-lock" class="text-amber-500" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          我的私有角色
        </span>
        <UBadge color="warning" variant="subtle" size="xs">
          {{ filteredPrivateCharacters.length }}
        </UBadge>
      </div>
      <CharactersList :characters="filteredPrivateCharacters" class="mb-8" />
      <UDivider
        v-if="!loading && characters.length > 0"
        label="公开角色"
        class="mb-6"
      />
    </template>

    <!-- 初始加载状态 - 骨架屏 -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <UCard v-for="i in limit" :key="i">
        <div class="flex items-start gap-4">
          <USkeleton class="h-12 w-12 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- 角色网格 -->
    <div v-else-if="characters.length > 0">
      <CharactersList :characters="characters" />

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <UPagination v-model="page" :total="total" :items-per-page="limit" />
      </div>
    </div>

    <!-- 空状态（公开列表为空且无私有角色） -->
    <div
      v-else-if="!loading && filteredPrivateCharacters.length === 0"
      class="text-center py-16"
    >
      <UIcon
        :name="searchQuery ? 'i-lucide-search-x' : 'i-lucide-users'"
        class="text-6xl text-gray-300 mx-auto mb-4"
      />
      <p class="text-gray-500 text-lg">
        {{ searchQuery ? '没有找到匹配的角色' : '还没有角色' }}
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
        to="/characters/create"
        color="primary"
        class="mt-4"
        icon="i-lucide-plus"
      >
        创建第一个角色
      </UButton>
    </div>
  </UContainer>
</template>
