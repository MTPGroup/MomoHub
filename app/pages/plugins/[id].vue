<script setup lang="ts">
import type { PluginDetailResponse } from '~/types'
import { getApiErrorMessage } from '~/types'

const route = useRoute()
const pluginId = route.params.id as string
const { getPlugin } = usePlugins()

const plugin = ref<PluginDetailResponse | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await getPlugin(pluginId)
    if (response.success && response.data) {
      plugin.value = response.data
    } else {
      error.value = '插件不存在'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载插件失败')
  } finally {
    loading.value = false
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <UContainer class="py-8">
    <UButton
      to="/plugins"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回列表
    </UButton>

    <!-- 加载状态 -->
    <div v-if="loading">
      <UCard>
        <div class="space-y-3">
          <USkeleton class="h-6 w-1/3" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </UCard>
    </div>

    <!-- 错误状态 -->
    <UAlert
      v-else-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
    />

    <!-- 插件详情 -->
    <div
      v-else-if="plugin"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-950">
              <UIcon
                name="i-lucide-puzzle"
                class="text-3xl text-blue-500"
              />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ plugin.name }}
                </h1>
                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  v{{ plugin.version }}
                </UBadge>
              </div>
              <p class="text-gray-500 mt-1">
                {{ plugin.description }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Schema 信息 -->
        <UCard v-if="plugin.schema">
          <template #header>
            <h2 class="text-lg font-semibold">
              接口定义
            </h2>
          </template>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <pre class="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">{{ JSON.stringify(plugin.schema, null, 2) }}</pre>
          </div>
        </UCard>
      </div>

      <!-- 右侧信息 -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              信息
            </h3>
          </template>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">版本</span>
              <span class="font-medium">{{ plugin.version }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">状态</span>
              <UBadge
                :color="plugin.status === 'ACTIVE' ? 'success' : 'neutral'"
                size="xs"
                variant="subtle"
              >
                {{ plugin.status }}
              </UBadge>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">创建时间</span>
              <span class="text-sm">{{ formatDate(plugin.createdAt) }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
