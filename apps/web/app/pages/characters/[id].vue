<script setup lang="ts">
import type { CharacterResponse } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const route = useRoute()
const characterId = route.params.id as string
const { getCharacter, deleteCharacter, listCharacterKnowledgeBases } =
  useCharacters()
const { listPublicKnowledgeBases } = useKnowledge()
const authStore = useAuthStore()

const character = ref<CharacterResponse | null>(null)
const loading = ref(true)
const error = ref('')
const knowledgeBases = ref<{ id: string; name: string }[]>([])

const fetchData = async () => {
  try {
    const [charResponse, kbResponse] = await Promise.all([
      getCharacter(characterId),
      listCharacterKnowledgeBases(characterId),
    ])

    if (charResponse.success && charResponse.data) {
      character.value = charResponse.data
    } else {
      error.value = '角色不存在'
      loading.value = false
      return
    }

    // 获取知识库订阅信息
    if (kbResponse.success && kbResponse.data) {
      // 获取所有知识库信息来匹配名称
      const allKbResponse = await listPublicKnowledgeBases({ limit: 100 })
      if (allKbResponse.success && allKbResponse.data) {
        const allKbs = (
          allKbResponse.data as { items: { id: string; name: string }[] }
        ).items
        knowledgeBases.value = kbResponse.data.map((sub) => {
          const kb = allKbs.find((k) => k.id === sub.knowledgeBaseId)
          return {
            id: sub.knowledgeBaseId,
            name: kb?.name || '未知知识库',
          }
        })
      }
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载角色失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const isOwner = computed(() => {
  return (
    authStore.user &&
    character.value &&
    authStore.user.userId === character.value.authorId
  )
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleDelete = async () => {
  if (!confirm('确定要删除这个角色吗？')) return
  try {
    await deleteCharacter(characterId)
    navigateTo('/characters')
  } catch (e) {
    error.value = getApiErrorMessage(e, '删除失败')
  }
}

const showKnowledgeSubscription = ref(false)
const showEditModal = ref(false)

const openKnowledgeSubscription = () => {
  showKnowledgeSubscription.value = true
}

const openEditModal = () => {
  showEditModal.value = true
}
</script>

<template>
  <UContainer class="py-8">
    <!-- 返回按钮 -->
    <UButton
      to="/characters"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回列表
    </UButton>

    <!-- 加载状态 -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <div class="flex items-start gap-6">
            <USkeleton class="h-16 w-16 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-6 w-1/3" />
              <USkeleton class="h-4 w-1/4" />
            </div>
          </div>
        </UCard>
        <UCard>
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4 mt-2" />
        </UCard>
      </div>
    </div>

    <!-- 错误状态 -->
    <UAlert
      v-else-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
    />

    <!-- 角色详情 -->
    <div v-else-if="character" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 左侧：角色信息 -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <div class="flex items-start gap-6">
            <UAvatar
              :src="character.avatar || undefined"
              :alt="character.name"
              size="2xl"
            />
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ character.name }}
                  </h1>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    创建于 {{ formatDate(character.createdAt) }}
                  </p>
                </div>
                <UBadge
                  :color="character.isPublic ? 'success' : 'neutral'"
                  variant="subtle"
                >
                  {{ character.isPublic ? '公开' : '私密' }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">关于</h2>
          </template>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ character.bio || '暂无描述' }}
          </p>
        </UCard>

        <UCard v-if="character.originPrompt">
          <template #header>
            <h2 class="text-lg font-semibold">人设 / Prompt</h2>
          </template>
          <MDC
            :value="character.originPrompt"
            class="rounded-md font-mono px-4 -mt-12"
          />
        </UCard>
      </div>

      <!-- 右侧：操作面板 -->
      <div class="space-y-6">
        <UCard v-if="isOwner">
          <template #header>
            <h3 class="text-lg font-semibold">操作</h3>
          </template>
          <div class="space-y-3">
            <UButton
              block
              variant="outline"
              color="warning"
              icon="i-lucide-flask-conical"
              :to="`/characters/test/${character.id}`"
            >
              测试角色
            </UButton>
            <UButton
              v-if="isOwner"
              block
              variant="outline"
              icon="i-lucide-edit"
              @click="openEditModal"
            >
              编辑
            </UButton>
            <UButton
              v-if="isOwner"
              block
              variant="outline"
              color="info"
              icon="i-lucide-book-open"
              @click="openKnowledgeSubscription"
            >
              管理知识库订阅
            </UButton>
            <UButton
              v-if="isOwner"
              block
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              @click="handleDelete"
            >
              删除
            </UButton>
          </div>
        </UCard>

        <!-- 已订阅的知识库 -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-book-open" />
              <h3 class="text-lg font-semibold">已订阅的知识库</h3>
            </div>
          </template>
          <div v-if="knowledgeBases.length > 0" class="space-y-2">
            <div
              v-for="kb in knowledgeBases"
              :key="kb.id"
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <UIcon name="i-lucide-book-open" class="text-gray-400" />
              <NuxtLink
                :to="`/knowledge/${kb.id}`"
                class="text-sm hover:text-primary transition-colors"
              >
                {{ kb.name }}
              </NuxtLink>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">尚未订阅任何知识库</p>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">信息</h3>
          </template>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-500">创建时间</span>
              <span class="text-sm">{{ formatDate(character.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">更新时间</span>
              <span class="text-sm">{{ formatDate(character.updatedAt) }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>

  <!-- 知识库订阅 Modal -->
  <CharactersKnowledgeSubscriptionModal
    v-if="character"
    v-model:open="showKnowledgeSubscription"
    :character-id="characterId"
    :character-name="character.name"
    @subscribed="fetchData"
    @unsubscribed="fetchData"
  />

  <!-- 编辑角色 Modal -->
  <CharactersEditModal
    v-if="character"
    v-model:open="showEditModal"
    :character-id="characterId"
    :character-name="character.name"
    @updated="fetchData"
  />
</template>
