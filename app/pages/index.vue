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
</script>

<template>
  <div>
    <!-- Hero 区域 -->
    <UPageHero
      title="发现无限可能的 AI 角色"
      description="创建、分享、探索由社区驱动的智能体"
      :links="[
        {
          label: '开始探索',
          to: '/characters',
          trailingIcon: 'i-lucide-arrow-right',
          size: 'xl',
          color: 'primary'
        },
        {
          label: '创建角色',
          to: '/characters/create',
          color: 'neutral',
          variant: 'subtle',
          size: 'xl'
        }
      ]"
    />

    <!-- 热门角色区域 -->
    <UPageSection
      title="热门角色"
      description="发现社区最受欢迎的 AI 角色"
    >
      <UContainer>
        <!-- 加载骨架屏 -->
        <div
          v-if="loadingCharacters"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <UCard
            v-for="i in 4"
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

        <!-- 真实数据 -->
        <div v-else-if="hotCharacters.length > 0">
          <CharactersList :characters="hotCharacters" />
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="text-center py-8 text-gray-500"
        >
          还没有角色，快来创建第一个吧！
        </div>

        <div class="flex justify-center mt-8">
          <UButton
            to="/characters"
            variant="outline"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
          >
            查看更多角色
          </UButton>
        </div>
      </UContainer>
    </UPageSection>

    <!-- 功能特性区域 -->
    <UPageSection
      title="为什么选择 MomoHub"
      description="我们提供的功能让 AI 角色创作变得简单有趣"
    >
      <UPageGrid>
        <UPageCard
          icon="i-lucide-users"
          title="发现角色"
          description="探索社区中由创作者分享的 AI 角色，找到你感兴趣的智能体。"
        />
        <UPageCard
          icon="i-lucide-sparkles"
          title="创建角色"
          description="使用直观的工具创建你自己的 AI 角色，定义个性、知识和行为。"
        />
        <UPageCard
          icon="i-lucide-book-open"
          title="知识库"
          description="为你的角色附加知识库，让它们拥有专业的领域知识。"
        />
        <UPageCard
          icon="i-lucide-puzzle"
          title="插件扩展"
          description="通过插件系统扩展角色能力，连接外部服务和 API。"
        />
      </UPageGrid>
    </UPageSection>

    <!-- CTA 区域 -->
    <UPageSection>
      <UPageCTA
        title="准备好开始了吗？"
        description="加入 MomoHub 社区，开始你的 AI 角色创作之旅。"
        variant="subtle"
        :links="[
          {
            label: '立即开始',
            to: '/characters',
            trailingIcon: 'i-lucide-arrow-right',
            color: 'primary',
            size: 'xl'
          },
          {
            label: '了解更多',
            to: '/docs',
            color: 'neutral',
            variant: 'outline',
            size: 'xl'
          }
        ]"
      />
    </UPageSection>
  </div>
</template>
