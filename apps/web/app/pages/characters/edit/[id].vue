<script setup lang="ts">
import type { UpdateCharacterRequest } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const characterId = route.params.id as string

const { getCharacter, updateCharacter, uploadCharacterAvatar } = useCharacters()
const toast = useToast()

const loading = ref(false)
const fetchLoading = ref(true)
const fetchError = ref('')
const initialData = ref<UpdateCharacterRequest & { avatar?: string | null }>({
  name: '',
  bio: '',
  originPrompt: '',
  isPublic: true,
  avatar: null,
})

// 头像上传相关
const avatarFile = ref<File | null>(null)
const avatarPreview = ref('')
const avatarUploading = ref(false)

onMounted(async () => {
  try {
    const response = await getCharacter(characterId)
    if (response.success && response.data) {
      initialData.value = {
        name: response.data.name,
        bio: response.data.bio,
        originPrompt: response.data.originPrompt,
        isPublic: response.data.isPublic,
        avatar: response.data.avatar,
      }
      avatarPreview.value = response.data.avatar || ''
    } else {
      fetchError.value = '加载角色失败'
    }
  } catch (e) {
    fetchError.value = getApiErrorMessage(e, '加载角色失败')
  } finally {
    fetchLoading.value = false
  }
})

const onAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async (data: UpdateCharacterRequest) => {
  loading.value = true

  try {
    let avatarUrl: string | null | undefined = initialData.value.avatar

    if (avatarFile.value) {
      avatarUploading.value = true
      const avatarResponse = await uploadCharacterAvatar(characterId, avatarFile.value)
      avatarUploading.value = false
      if (!avatarResponse.success) {
        toast.add({
          title: avatarResponse.message || '头像上传失败',
          color: 'error',
          icon: 'i-lucide-alert-circle',
        })
        return
      }
      if (avatarResponse.data) {
        avatarUrl = avatarResponse.data.avatar
      }
    }

    const response = await updateCharacter(characterId, { ...data, avatar: avatarUrl })
    if (response.success) {
      navigateTo(`/characters/${characterId}`)
    } else {
      toast.add({
        title: response.message || '更新失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '更新失败，请检查网络连接'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    loading.value = false
    avatarUploading.value = false
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
      v-if="fetchError"
      color="error"
      :title="fetchError"
      icon="i-lucide-alert-circle"
      class="mb-6"
    />

    <div v-if="fetchLoading" class="space-y-4">
      <USkeleton class="h-24 w-24 rounded-full mx-auto" />
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-40 w-full" />
    </div>

    <UCard v-else class="space-y-6">
      <!-- 头像上传 -->
      <div class="flex flex-col items-center gap-4">
        <div class="relative group cursor-pointer">
          <UAvatar
            :src="avatarPreview || undefined"
            :text="initialData.name[0]"
            size="3xl"
            class="w-24 h-24 text-2xl"
          />
          <!-- Hover时的遮罩层 -->
          <div
            class="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <UIcon name="i-lucide-camera" class="w-8 h-8 text-white" />
          </div>
          <label class="absolute inset-0 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarChange"
            />
          </label>
        </div>
      </div>

      <CharactersForm
        :initial-data="initialData"
        :loading="loading || avatarUploading"
        submit-label="保存修改"
        @submit="handleSubmit"
      />
    </UCard>
  </UContainer>
</template>
