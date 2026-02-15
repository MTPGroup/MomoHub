<script setup lang="ts">
import type { CharacterResponse, KnowledgeBaseResponse, PagedResponse } from '~/types'
import { getApiErrorMessage } from '~/types'

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

// 编辑资料
const showEditProfile = ref(false)
const editProfileLoading = ref(false)
const editProfileError = ref('')
const editProfileSuccess = ref('')
const editForm = reactive({
  username: ''
})
const avatarFile = ref<File | null>(null)
const avatarPreview = ref('')
const avatarUploading = ref(false)

const openEditProfile = () => {
  editForm.username = authStore.user?.username || ''
  avatarFile.value = null
  avatarPreview.value = authStore.user?.avatar || ''
  editProfileError.value = ''
  editProfileSuccess.value = ''
  showEditProfile.value = true
}

const onAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const handleUpdateProfile = async () => {
  editProfileError.value = ''
  editProfileSuccess.value = ''
  editProfileLoading.value = true
  try {
    // 如果选择了新头像，先上传
    if (avatarFile.value) {
      avatarUploading.value = true
      const avatarResponse = await authStore.uploadAvatar(avatarFile.value)
      avatarUploading.value = false
      if (!avatarResponse.success) {
        editProfileError.value = avatarResponse.message || '头像上传失败'
        return
      }
    }

    const response = await authStore.updateProfile({
      username: editForm.username
    })
    if (response.success) {
      editProfileSuccess.value = '个人信息已更新'
      setTimeout(() => {
        showEditProfile.value = false
      }, 1000)
    } else {
      editProfileError.value = response.message || '更新失败'
    }
  } catch (e) {
    editProfileError.value = getApiErrorMessage(e, '更新失败')
  } finally {
    editProfileLoading.value = false
    avatarUploading.value = false
  }
}

// 修改密码
const showChangePassword = ref(false)
const changePasswordLoading = ref(false)
const changePasswordError = ref('')
const changePasswordSuccess = ref('')
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const openChangePassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
  changePasswordError.value = ''
  changePasswordSuccess.value = ''
  showChangePassword.value = true
}

const handleChangePassword = async () => {
  changePasswordError.value = ''
  changePasswordSuccess.value = ''

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    changePasswordError.value = '两次输入的密码不一致'
    return
  }

  changePasswordLoading.value = true
  try {
    const response = await authStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    if (response.success) {
      changePasswordSuccess.value = '密码修改成功'
      setTimeout(() => {
        showChangePassword.value = false
      }, 1000)
    } else {
      changePasswordError.value = response.message || '修改失败'
    }
  } catch (e) {
    changePasswordError.value = getApiErrorMessage(e, '修改密码失败')
  } finally {
    changePasswordLoading.value = false
  }
}

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
        <div class="ml-auto flex gap-2">
          <UButton
            variant="soft"
            icon="i-lucide-pencil"
            @click="openEditProfile"
          >
            编辑资料
          </UButton>
          <UButton
            variant="soft"
            icon="i-lucide-key-round"
            @click="openChangePassword"
          >
            修改密码
          </UButton>
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
    <!-- 编辑资料弹窗 -->
    <UModal v-model:open="showEditProfile">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-center mb-4">
            编辑个人资料
          </h2>

          <!-- 头像上传 -->
          <label class="group relative mx-auto mb-6 block h-20 w-20 cursor-pointer rounded-full">
            <UAvatar
              :src="avatarPreview || undefined"
              size="3xl"
              icon="i-lucide-user"
              class="h-20 w-20"
            />
            <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
              <UIcon
                name="i-lucide-camera"
                class="text-2xl text-white opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarChange"
            >
          </label>

          <form
            class="space-y-4"
            @submit.prevent="handleUpdateProfile"
          >
            <UAlert
              v-if="editProfileError"
              color="error"
              :title="editProfileError"
              icon="i-lucide-alert-circle"
            />
            <UAlert
              v-if="editProfileSuccess"
              color="success"
              :title="editProfileSuccess"
              icon="i-lucide-check-circle"
            />

            <UFormField label="用户名">
              <UInput
                v-model="editForm.username"
                placeholder="输入用户名"
                icon="i-lucide-user"
                required
                class="w-full"
              />
            </UFormField>

            <UButton
              type="submit"
              block
              size="lg"
              :loading="editProfileLoading"
            >
              保存
            </UButton>
          </form>
        </div>
      </template>
    </UModal>

    <!-- 修改密码弹窗 -->
    <UModal v-model:open="showChangePassword">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-center mb-6">
            修改密码
          </h2>
          <form
            class="space-y-4"
            @submit.prevent="handleChangePassword"
          >
            <UAlert
              v-if="changePasswordError"
              color="error"
              :title="changePasswordError"
              icon="i-lucide-alert-circle"
            />
            <UAlert
              v-if="changePasswordSuccess"
              color="success"
              :title="changePasswordSuccess"
              icon="i-lucide-check-circle"
            />

            <UFormField label="当前密码">
              <UInput
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="输入当前密码"
                icon="i-lucide-lock"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField label="新密码">
              <UInput
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="输入新密码"
                icon="i-lucide-lock"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField label="确认新密码">
              <UInput
                v-model="passwordForm.confirmNewPassword"
                type="password"
                placeholder="再次输入新密码"
                icon="i-lucide-lock"
                required
                class="w-full"
              />
            </UFormField>

            <UButton
              type="submit"
              block
              size="lg"
              :loading="changePasswordLoading"
            >
              修改密码
            </UButton>
          </form>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
