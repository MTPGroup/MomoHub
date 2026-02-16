<script setup lang="ts">
import type { CreateKnowledgeBaseRequest } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

definePageMeta({
  middleware: ['auth'],
})

const { createKnowledgeBase } = useKnowledge()

const form = reactive<CreateKnowledgeBaseRequest>({
  name: '',
  description: '',
  isPublic: true,
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await createKnowledgeBase(form)
    if (response.success && response.data) {
      navigateTo(`/knowledge/${response.data.id}`)
    } else {
      error.value = response.message || '创建失败'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <UButton
      to="/knowledge"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回列表
    </UButton>

    <h1 class="text-3xl font-bold mb-8">创建知识库</h1>

    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <UCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <UFormField label="知识库名称" required>
          <UInput
            v-model="form.name"
            placeholder="给知识库取个名字"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="描述">
          <UTextarea
            v-model="form.description"
            placeholder="描述这个知识库的内容..."
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField label="可见性">
          <USwitch v-model="form.isPublic" label="公开知识库" />
          <p class="text-xs text-gray-500 mt-1">
            {{ form.isPublic ? '所有人都可以访问' : '仅自己可见' }}
          </p>
        </UFormField>

        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" color="neutral" @click="$router.back()">
            取消
          </UButton>
          <UButton type="submit" :loading="loading"> 创建知识库 </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>
