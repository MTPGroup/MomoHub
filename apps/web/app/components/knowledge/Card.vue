<script setup lang="ts">
import type { KnowledgeBaseResponse } from '@momohub/types'

interface Props {
  knowledgeBase: KnowledgeBaseResponse
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
  <NuxtLink :to="`/knowledge/${knowledgeBase.id}`" class="group block">
    <UCard
      class="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-(--ui-color-primary)"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-950 shrink-0"
        >
          <UIcon
            name="i-lucide-book-open"
            class="text-xl text-primary transition-colors group-hover:text-(--ui-color-primary)"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3
            class="font-semibold text-gray-900 dark:text-white truncate transition-colors group-hover:text-(--ui-color-primary)"
          >
            {{ knowledgeBase.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {{ knowledgeBase.description || '暂无描述' }}
          </p>
        </div>
      </div>

      <!-- 底部信息栏 -->
      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <!-- 左侧：状态标签 + 日期 -->
          <div class="flex items-center gap-2">
            <UBadge
              v-if="knowledgeBase.isPublic"
              size="xs"
              color="success"
              variant="subtle"
            >
              公开
            </UBadge>
            <UBadge v-else size="xs" color="neutral" variant="subtle">
              私密
            </UBadge>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              {{ formatDate(knowledgeBase.createdAt) }}
            </span>
          </div>

          <!-- 右侧：作者信息 -->
          <div
            v-if="knowledgeBase.author"
            class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
          >
            <UAvatar
              :src="knowledgeBase.author.avatar || undefined"
              :alt="knowledgeBase.author.name"
              size="2xs"
            />
            <span class="text-xs max-w-20 truncate">
              {{ knowledgeBase.author.name }}
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
