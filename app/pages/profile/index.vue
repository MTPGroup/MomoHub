<script setup lang="ts">
import type { CharacterResponse, KnowledgeBaseResponse, PagedResponse } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
const { listCharacters } = useCharacters()
const { listKnowledgeBases } = useKnowledge()

const activeTab = ref('characters')
const myCharacters = ref<CharacterResponse[]>([])
const myKnowledgeBases = ref<KnowledgeBaseResponse[]>([])
const loadingCharacters = ref(true)
const loadingKnowledge = ref(true)

onMounted(async () => {
  try {
    const charResponse = await listCharacters({ limit: 50 })
    if (charResponse.success && charResponse.data) {
      const data = charResponse.data as PagedResponse<CharacterResponse>
      myCharacters.value = data.items
    }
  } catch {
    // ignore
  } finally {
    loadingCharacters.value = false
  }

  try {
    const kbResponse = await listKnowledgeBases({ limit: 50 })
    if (kbResponse.success && kbResponse.data) {
      const data = kbResponse.data as PagedResponse<KnowledgeBaseResponse>
      myKnowledgeBases.value = data.items
    }
  } catch {
    // ignore
  } finally {
    loadingKnowledge.value = false
  }
})

const tabs = [
  { label: '我的角色', value: 'characters', icon: 'i-lucide-users' },
  { label: '我的知识库', value: 'knowledge', icon: 'i-lucide-book-open' }
]
</script>

<template>
  <UContainer class="py-8">
    <!-- 用户信息 -->
    <UCard class="mb-8">
      <div class="flex items-center gap-6">
        <UAvatar
          :src="authStore.user?.avatar || undefined"
          size="2xl"
          icon="i-lucide-user"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ authStore.user?.username }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ authStore.user?.email }}
          </p>
          <div class="flex gap-2 mt-3">
            <UBadge
              v-if="authStore.user?.isEmailVerified"
              color="success"
              variant="subtle"
              size="xs"
            >
              邮箱已验证
            </UBadge>
            <UBadge
              v-else
              color="warning"
              variant="subtle"
              size="xs"
            >
              邮箱未验证
            </UBadge>
          </div>
        </div>
        <div class="ml-auto">
          <UButton
            variant="ghost"
            color="error"
            icon="i-lucide-log-out"
            @click="authStore.logout"
          >
            退出登录
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- 标签页 -->
    <UTabs
      v-model="activeTab"
      :items="tabs"
    >
      <template #content="{ item }">
        <!-- 我的角色 -->
        <div
          v-if="item.value === 'characters'"
          class="pt-6"
        >
          <div
            v-if="loadingCharacters"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <UCard
              v-for="i in 3"
              :key="i"
            >
              <div class="flex items-start gap-4">
                <USkeleton class="h-12 w-12 rounded-full" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-3/4" />
                  <USkeleton class="h-3 w-full" />
                </div>
              </div>
            </UCard>
          </div>

          <div v-else-if="myCharacters.length > 0">
            <CharactersList :characters="myCharacters" />
          </div>

          <div
            v-else
            class="text-center py-12"
          >
            <UIcon
              name="i-lucide-users"
              class="text-4xl text-gray-300 mx-auto mb-3"
            />
            <p class="text-gray-500">
              还没有创建角色
            </p>
            <UButton
              to="/characters/create"
              class="mt-4"
              icon="i-lucide-plus"
            >
              创建角色
            </UButton>
          </div>
        </div>

        <!-- 我的知识库 -->
        <div
          v-if="item.value === 'knowledge'"
          class="pt-6"
        >
          <div
            v-if="loadingKnowledge"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <UCard
              v-for="i in 3"
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

          <div v-else-if="myKnowledgeBases.length > 0">
            <KnowledgeList :knowledge-bases="myKnowledgeBases" />
          </div>

          <div
            v-else
            class="text-center py-12"
          >
            <UIcon
              name="i-lucide-book-open"
              class="text-4xl text-gray-300 mx-auto mb-3"
            />
            <p class="text-gray-500">
              还没有创建知识库
            </p>
            <UButton
              to="/knowledge/create"
              class="mt-4"
              icon="i-lucide-plus"
            >
              创建知识库
            </UButton>
          </div>
        </div>
      </template>
    </UTabs>
  </UContainer>
</template>
