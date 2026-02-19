<script setup lang="ts">
import type { UpdateCharacterRequest } from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const props = defineProps<{
  characterId: string
  characterName: string
}>()

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { getCharacter, updateCharacter, uploadCharacterAvatar } = useCharacters()
const toast = useToast()

const loading = ref(false)
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

// 加载角色数据
const loadCharacterData = async () => {
  try {
    const response = await getCharacter(props.characterId)
    if (response.success && response.data) {
      initialData.value = {
        name: response.data.name,
        bio: response.data.bio,
        originPrompt: response.data.originPrompt,
        isPublic: response.data.isPublic,
        avatar: response.data.avatar,
      }
      avatarPreview.value = response.data.avatar || ''
      avatarFile.value = null
    } else {
      toast.add({
        title: '加载角色失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '加载角色失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

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
      const avatarResponse = await uploadCharacterAvatar(
        props.characterId,
        avatarFile.value,
      )
      avatarUploading.value = false
      if (!avatarResponse.success) {
        toast.add({
          title: avatarResponse.message || '头像上传失败',
          color: 'error',
          icon: 'i-lucide-alert-circle',
        })
        loading.value = false
        return
      }
      if (avatarResponse.data) {
        avatarUrl = avatarResponse.data.avatar
      }
    }

    const response = await updateCharacter(props.characterId, {
      ...data,
      avatar: avatarUrl,
    })
    if (response.success) {
      toast.add({
        title: '角色更新成功',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
      open.value = false
      emit('updated')
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
  }
}

// 监听 Modal 打开状态
watch(open, (val) => {
  if (val) {
    loadCharacterData()
  }
})
</script>

<template>
  <UModal v-model:open="open" title="编辑角色" description="修改角色信息和设置">
    <template #content>
      <div class="p-6">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold">编辑角色</h2>
          <p class="text-sm text-gray-500 mt-1">
            修改「{{ characterName }}」的信息
          </p>
        </div>

        <!-- 头像上传 -->
        <div class="flex flex-col items-center gap-4 mb-6">
          <div class="relative group cursor-pointer">
            <UAvatar
              :src="avatarPreview || undefined"
              :text="initialData.name?.[0] ?? 'U'"
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
      </div>
    </template>
  </UModal>
</template>
