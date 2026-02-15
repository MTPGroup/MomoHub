<script setup lang="ts">
import type { CharacterResponse, PagedResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const { listPublicCharacters } = useCharacters()

const searchQuery = ref('')
const page = ref(1)
const limit = 12

const characters = ref<CharacterResponse[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')

const fetchCharacters = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await listPublicCharacters({
      page: page.value,
      limit,
      search: searchQuery.value || undefined
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
    loading.value = false
  }
}

watch(page, fetchCharacters)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchCharacters()
  }, 300)
})

onMounted(fetchCharacters)
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
      <UButton
        to="/characters/create"
        color="primary"
        icon="i-lucide-plus"
      >
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

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <UCard
        v-for="i in limit"
        :key="i"
      >
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
      <div
        v-if="totalPages > 1"
        class="flex justify-center mt-8"
      >
        <UPagination
          v-model="page"
          :total="total"
          :items-per-page="limit"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="text-center py-16"
    >
      <UIcon
        name="i-lucide-search-x"
        class="text-6xl text-gray-300 mx-auto mb-4"
      />
      <p class="text-gray-500 text-lg">
        没有找到匹配的角色
      </p>
      <UButton
        v-if="searchQuery"
        variant="ghost"
        class="mt-4"
        @click="searchQuery = ''"
      >
        清除搜索
      </UButton>
    </div>
  </UContainer>
</template>
