<script setup lang="ts">
import type { UpdateCharacterRequest } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const characterId = route.params.id as string

const { getCharacter, updateCharacter } = useCharacters()

const loading = ref(false)
const fetchLoading = ref(true)
const error = ref('')
const initialData = ref<UpdateCharacterRequest>({
  name: '',
  bio: '',
  originPrompt: '',
  isPublic: true,
})

onMounted(async () => {
  try {
    const response = await getCharacter(characterId)
    if (response.success && response.data) {
      initialData.value = {
        name: response.data.name,
        bio: response.data.bio,
        originPrompt: response.data.originPrompt,
        isPublic: response.data.isPublic,
      }
    } else {
      error.value = '加载角色失败'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载角色失败')
  } finally {
    fetchLoading.value = false
  }
})

const handleSubmit = async (data: UpdateCharacterRequest) => {
  error.value = ''
  loading.value = true
  try {
    const response = await updateCharacter(characterId, data)
    if (response.success) {
      navigateTo(`/characters/${characterId}`)
    } else {
      error.value = response.message || '更新失败'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '更新失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <UButton
      :to="`/characters/${characterId}`"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回详情
    </UButton>

    <h1 class="text-3xl font-bold mb-8">编辑角色</h1>

    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <div v-if="fetchLoading" class="space-y-4">
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-40 w-full" />
    </div>

    <UCard v-else>
      <CharactersForm
        :initial-data="initialData"
        :loading="loading"
        submit-label="保存修改"
        @submit="handleSubmit"
      />
    </UCard>
  </UContainer>
</template>
