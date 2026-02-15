<script setup lang="ts">
import type { CharacterResponse, PagedResponse } from '~/types'

const { listPublicCharacters } = useCharacters()

const hotCharacters = ref<CharacterResponse[]>([])
const loadingCharacters = ref(true)

onMounted(async () => {
  try {
    const response = await listPublicCharacters({ page: 1, limit: 4 })
    if (response.success && response.data) {
      const data = response.data as PagedResponse<CharacterResponse>
      hotCharacters.value = data.items
    }
  } catch {
    // ignore on homepage
  } finally {
    loadingCharacters.value = false
  }
})

const features = [
  {
    icon: 'i-lucide-users',
    title: '发现角色',
    description: '探索社区中由创作者分享的 AI 角色，找到你感兴趣的智能体。'
  },
  {
    icon: 'i-lucide-sparkles',
    title: '创建角色',
    description: '使用直观的工具创建你自己的 AI 角色，定义个性、知识和行为。'
  },
  {
    icon: 'i-lucide-book-open',
    title: '知识库',
    description: '为你的角色附加知识库，让它们拥有专业的领域知识。'
  },
  {
    icon: 'i-lucide-puzzle',
    title: '插件扩展',
    description: '通过插件系统扩展角色能力，连接外部服务和 API。'
  }
]
</script>

<template>
  <UPageSection class="overflow-hidden">
    <!-- 背景装饰光斑 -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-[-20%] left-[-10%] h-125 w-125 rounded-full bg-(--ui-color-primary)/10 blur-3xl" />
      <div class="absolute bottom-[-20%] right-[-10%] h-100 w-100 rounded-full bg-(--ui-color-primary)/5 blur-3xl" />
    </div>

    <UContainer class="py-24 lg:py-32 text-center">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        发现无限可能的
        <span class="bg-linear-to-r from-(--ui-color-primary) to-emerald-400 bg-clip-text text-transparent">
          AI 角色
        </span>
      </h1>
      <p class="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        创建、分享、探索由社区驱动的智能体，释放 AI 的无限创造力
      </p>

      <!-- 操作按钮 -->
      <div class="mt-10 flex flex-wrap justify-center gap-4">
        <UButton
          to="/characters"
          size="xl"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
        >
          开始探索
        </UButton>
        <UButton
          to="/characters/create"
          size="xl"
          color="neutral"
          variant="subtle"
        >
          创建角色
        </UButton>
      </div>
      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="feature in features"
          :key="feature.title"
          class="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="flex flex-col items-center gap-4 py-2">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-(--ui-color-primary)/10">
              <UIcon
                :name="feature.icon"
                class="text-2xl bg-primary"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </UCard>
      </div>
    </UContainer>
  </UPageSection>
</template>
