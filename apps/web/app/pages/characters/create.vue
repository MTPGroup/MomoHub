<script setup lang="ts">
import type { CreateCharacterRequest } from '~/types'
import { getApiErrorMessage } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const { createCharacter } = useCharacters()
const loading = ref(false)
const error = ref('')

const handleSubmit = async (data: CreateCharacterRequest) => {
  error.value = ''
  loading.value = true
  try {
    const response = await createCharacter(data)
    if (response.success && response.data) {
      navigateTo(`/characters/${response.data.id}`)
    } else {
      error.value = response.message || '创建失败'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '创建失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <UButton
      to="/characters"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回列表
    </UButton>

    <h1 class="text-3xl font-bold mb-8">
      创建角色
    </h1>

    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <UCard>
      <CharactersForm
        :loading="loading"
        submit-label="创建角色"
        @submit="handleSubmit"
      />
    </UCard>
  </UContainer>
</template>
