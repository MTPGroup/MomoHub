<script setup lang="ts">
import type { PluginResponse, PagedResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const { listPlugins } = usePlugins()

const page = ref(1)
const limit = 12

const plugins = ref<PluginResponse[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await listPlugins({
      page: page.value,
      limit
    })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<PluginResponse>
      plugins.value = data.items
      total.value = data.total
      totalPages.value = data.totalPages
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载插件列表失败')
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
        插件市场
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        发现和安装扩展插件
      </p>
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
      <UCard
        v-for="i in 8"
        :key="i"
      >
        <div class="flex items-start gap-4">
          <USkeleton class="h-12 w-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-full" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- 插件列表 -->
    <div v-else-if="plugins.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <PluginsCard
          v-for="plugin in plugins"
          :key="plugin.id"
          :plugin="plugin"
        />
      </div>

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
        name="i-lucide-puzzle"
        class="text-6xl text-gray-300 mx-auto mb-4"
      />
      <p class="text-gray-500 text-lg">
        暂无插件
      </p>
    </div>
  </UContainer>
</template>
