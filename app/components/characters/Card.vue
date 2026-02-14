<script setup lang="ts">
import type { CharacterResponse } from '~/types'

interface Props {
  character: CharacterResponse
}

defineProps<Props>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <UCard class="h-full hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-start gap-4">
      <UAvatar
        :src="character.avatar || undefined"
        :alt="character.name"
        size="lg"
      />
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ character.name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {{ character.bio || '暂无描述' }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <UBadge
            v-if="character.isPublic"
            size="xs"
            color="success"
            variant="subtle"
          >
            公开
          </UBadge>
          <UBadge
            v-else
            size="xs"
            color="neutral"
            variant="subtle"
          >
            私密
          </UBadge>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-400 dark:text-gray-500">
          {{ formatDate(character.createdAt) }}
        </span>
        <UButton
          :to="`/characters/${character.id}`"
          size="xs"
          variant="ghost"
          icon="i-lucide-eye"
          label="查看"
        />
      </div>
    </template>
  </UCard>
</template>
