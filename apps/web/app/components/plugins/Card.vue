<script setup lang="ts">
import type { PluginResponse } from '@momohub/types'

interface Props {
  plugin: PluginResponse
}

defineProps<Props>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <UCard class="h-full hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-start gap-4">
      <div
        class="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950"
      >
        <UIcon name="i-lucide-puzzle" class="text-xl text-blue-500" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-gray-900 dark:text-white truncate">
            {{ plugin.name }}
          </h3>
          <UBadge size="xs" color="neutral" variant="subtle">
            v{{ plugin.version }}
          </UBadge>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {{ plugin.description }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-400 dark:text-gray-500">
          {{ formatDate(plugin.createdAt) }}
        </span>
        <UButton
          :to="`/plugins/${plugin.id}`"
          size="xs"
          variant="ghost"
          icon="i-lucide-eye"
          label="查看"
        />
      </div>
    </template>
  </UCard>
</template>
