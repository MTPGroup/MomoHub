<script setup lang="ts">
import type { KnowledgeBaseResponse, PagedResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const { listPublicKnowledgeBases } = useKnowledge()

const page = ref(1)
const limit = 12

const knowledgeBases = ref<KnowledgeBaseResponse[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await listPublicKnowledgeBases({
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
    loading.value = false
  }
}

watch(page, fetchData)
onMounted(fetchData)
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        知识库
      </h1>
      <p class="text-gray-600 dark:text-gray-400">探索和管理知识库资源</p>
    </div>

    <div class="flex justify-end mb-8">
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

    <!-- 加载状态 -->
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

    <!-- 空状态 -->
    <div v-else class="text-center py-16">
      <UIcon
        name="i-lucide-book-open"
        class="text-6xl text-gray-300 mx-auto mb-4"
      />
      <p class="text-gray-500 text-lg">还没有知识库</p>
      <UButton to="/knowledge/create" class="mt-4" icon="i-lucide-plus">
        创建第一个知识库
      </UButton>
    </div>
  </UContainer>
</template>
