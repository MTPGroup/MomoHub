<script setup lang="ts">
import type { CreateCharacterRequest } from '@momohub/types'

interface Props {
  initialData?: CreateCharacterRequest
  loading?: boolean
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    name: '',
    bio: '',
    originPrompt: '',
    isPublic: true,
  }),
  loading: false,
  submitLabel: '创建',
})

const emit = defineEmits<{
  submit: [data: CreateCharacterRequest]
}>()

const form = reactive<CreateCharacterRequest>({
  name: props.initialData.name,
  bio: props.initialData.bio,
  originPrompt: props.initialData.originPrompt,
  isPublic: props.initialData.isPublic ?? true,
})

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <UFormField label="角色名称" required>
      <UInput
        v-model="form.name"
        placeholder="给你的角色取个名字"
        class="w-full"
        required
      />
    </UFormField>

    <UFormField label="角色描述">
      <UTextarea
        v-model="form.bio"
        placeholder="描述一下你的角色..."
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <UFormField label="人设 / Prompt">
      <UTextarea
        v-model="form.originPrompt"
        placeholder="定义角色的个性、行为和知识..."
        :rows="6"
        class="w-full"
      />
    </UFormField>

    <UFormField label="可见性">
      <USwitch v-model="form.isPublic" label="公开角色" />
      <p class="text-xs text-gray-500 mt-1">
        {{ form.isPublic ? '所有人都可以看到你的角色' : '仅自己可见' }}
      </p>
    </UFormField>

    <div class="flex gap-3 justify-end">
      <UButton variant="ghost" color="neutral" @click="$router.back()">
        取消
      </UButton>
      <UButton type="submit" :loading="loading">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>
