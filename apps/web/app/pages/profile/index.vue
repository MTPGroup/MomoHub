<script setup lang="ts">
import type {
  CharacterResponse,
  KnowledgeBaseResponse,
  PagedResponse,
} from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()
const { listCharacters } = useCharacters()
const { listKnowledgeBases } = useKnowledge()
const toast = useToast()

const activeTab = ref('characters')
const myCharacters = ref<CharacterResponse[]>([])
const myKnowledgeBases = ref<KnowledgeBaseResponse[]>([])
const loadingCharacters = ref(true)
const loadingKnowledge = ref(true)

// 编辑资料
const showEditProfile = ref(false)
const editProfileLoading = ref(false)
const editForm = reactive({
  username: '',
})
const avatarFile = ref<File | null>(null)
const avatarPreview = ref('')
const avatarUploading = ref(false)

const openEditProfile = () => {
  editForm.username = authStore.user?.username || ''
  avatarFile.value = null
  avatarPreview.value = authStore.user?.avatar || ''
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
  console.log('[Profile] 开始更新资料', {
    username: editForm.username,
    hasAvatar: !!avatarFile.value,
  })
  editProfileLoading.value = true

  try {
    let avatarUrl = authStore.user?.avatar
    console.log('[Profile] 当前头像URL:', avatarUrl)

    if (avatarFile.value) {
      console.log('[Profile] 开始上传头像:', avatarFile.value.name)
      avatarUploading.value = true
      const avatarResponse = await authStore.uploadAvatar(avatarFile.value)
      console.log('[Profile] 头像上传响应:', avatarResponse)
      avatarUploading.value = false

      if (!avatarResponse.success) {
        console.error('[Profile] 头像上传失败:', avatarResponse.message)
        toast.add({
          title: avatarResponse.message || '头像上传失败',
          color: 'error',
          icon: 'i-lucide-alert-circle',
        })
        return
      }

      if (avatarResponse.data) {
        avatarUrl = avatarResponse.data.avatar
        if (authStore.user) {
          authStore.user.avatar = avatarResponse.data.avatar
        }
        console.log('[Profile] 头像上传成功，新URL:', avatarUrl)
      }
    }

    console.log('[Profile] 开始更新资料，请求数据:', {
      username: editForm.username,
      avatar: avatarUrl,
    })
    const response = await authStore.updateProfile({
      username: editForm.username,
      avatar: avatarUrl,
    })
    console.log('[Profile] 更新资料响应:', response)

    if (response.success) {
      console.log('[Profile] 更新成功，关闭Modal')
      showEditProfile.value = false
      toast.add({
        title: '资料更新成功',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      console.error('[Profile] 更新失败:', response.message)
      toast.add({
        title: response.message || '更新失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    console.error('[Profile] 更新资料异常:', e)
    toast.add({
      title: getApiErrorMessage(e, '更新失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    console.log('[Profile] 更新资料结束，重置loading状态')
    editProfileLoading.value = false
    avatarUploading.value = false
  }
}

// 注销账号
const showDeleteAccount = ref(false)
const deleteAccountLoading = ref(false)

const handleDeleteAccount = async () => {
  deleteAccountLoading.value = true
  try {
    await authStore.deleteAccount()
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '注销失败，请稍后重试'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
    deleteAccountLoading.value = false
  }
}

// 修改密码
const showChangePassword = ref(false)
const changePasswordLoading = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const openChangePassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
  showChangePassword.value = true
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    toast.add({
      title: '两次输入的密码不一致',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  changePasswordLoading.value = true
  try {
    const response = await authStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
    if (response.success) {
      showChangePassword.value = false
      toast.add({
        title: '密码修改成功',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      toast.add({
        title: response.message || '修改失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '修改密码失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
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
  { label: '我的知识库', value: 'knowledge', icon: 'i-lucide-book-open' },
]
</script>

<template>
  <UContainer class="py-8">
    <!-- 用户信息 -->
    <UCard class="mb-8">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- 头像 -->
        <div class="relative group">
          <UAvatar
            :src="authStore.user?.avatar || undefined"
            size="3xl"
            :text="authStore.user?.username?.[0] ?? 'U'"
            class="ring-4 ring-gray-100 dark:ring-gray-800 w-28! h-28! text-3xl md:w-24! md:h-24!"
          />
          <div
            class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            :class="
              authStore.user?.isEmailVerified ? 'bg-green-500' : 'bg-amber-500'
            "
          >
            <UIcon
              :name="
                authStore.user?.isEmailVerified
                  ? 'i-lucide-badge-check'
                  : 'i-lucide-alert-circle'
              "
              class="text-white text-xs"
            />
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="flex-1 text-center md:text-left">
          <h1
            class="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2"
          >
            {{ authStore.user?.username }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ authStore.user?.email }}
          </p>
          <div class="flex gap-2 mt-3 justify-center md:justify-start">
            <UBadge
              v-if="authStore.user?.isEmailVerified"
              color="success"
              variant="subtle"
              size="sm"
            >
              <UIcon name="i-lucide-shield-check" class="mr-1" />
              邮箱已验证
            </UBadge>
            <UBadge v-else color="warning" variant="subtle" size="sm">
              <UIcon name="i-lucide-shield-alert" class="mr-1" />
              邮箱未验证
            </UBadge>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-2 justify-center">
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
          <UDropdownMenu
            :items="[
              {
                label: '退出登录',
                icon: 'i-lucide-log-out',
                onSelect: authStore.logout,
              },
              {
                label: '注销账号',
                icon: 'i-lucide-trash-2',
                color: 'error' as const,
                onSelect: () => (showDeleteAccount = true),
              },
            ]"
          >
            <UButton variant="ghost" icon="i-lucide-more-vertical" />
          </UDropdownMenu>
        </div>
      </div>
    </UCard>

    <!-- 标签页 -->
    <UTabs v-model="activeTab" :items="tabs">
      <template #content="{ item }">
        <!-- 我的角色 -->
        <div v-if="item.value === 'characters'" class="pt-6">
          <div
            v-if="loadingCharacters"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <UCard v-for="i in 3" :key="i">
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

          <div v-else class="text-center py-12">
            <UIcon
              name="i-lucide-users"
              class="text-4xl text-gray-300 mx-auto mb-3"
            />
            <p class="text-gray-500">还没有创建角色</p>
            <UButton to="/characters/create" class="mt-4" icon="i-lucide-plus">
              创建角色
            </UButton>
          </div>
        </div>

        <!-- 我的知识库 -->
        <div v-if="item.value === 'knowledge'" class="pt-6">
          <div
            v-if="loadingKnowledge"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <UCard v-for="i in 3" :key="i">
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

          <div v-else class="text-center py-12">
            <UIcon
              name="i-lucide-book-open"
              class="text-4xl text-gray-300 mx-auto mb-3"
            />
            <p class="text-gray-500">还没有创建知识库</p>
            <UButton to="/knowledge/create" class="mt-4" icon="i-lucide-plus">
              创建知识库
            </UButton>
          </div>
        </div>
      </template>
    </UTabs>
    <!-- 编辑资料弹窗 -->
    <UModal
      v-model:open="showEditProfile"
      title="编辑个人资料"
      description="修改您的用户名和头像"
    >
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-center mb-4">编辑个人资料</h2>

          <!-- 头像上传 -->
          <label
            class="group relative mx-auto mb-6 block h-20 w-20 cursor-pointer rounded-full"
          >
            <UAvatar
              :src="avatarPreview || undefined"
              size="3xl"
              icon="i-lucide-user"
              class="h-20 w-20"
            />
            <div
              class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40"
            >
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
            />
          </label>

          <form class="space-y-4" @submit.prevent="handleUpdateProfile">
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
    <UModal
      v-model:open="showChangePassword"
      title="修改密码"
      description="更改您的账户密码"
    >
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-center mb-6">修改密码</h2>
          <form class="space-y-4" @submit.prevent="handleChangePassword">
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

    <!-- 注销账号确认弹窗 -->
    <UModal
      v-model:open="showDeleteAccount"
      title="注销账号"
      description="此操作将永久删除您的账号及所有相关数据"
    >
      <template #content>
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-bold text-center text-red-500">注销账号</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            此操作将<strong>永久删除</strong>您的账号及所有相关数据，包括角色、知识库和聊天记录。此操作不可撤销。
          </p>
          <div class="flex gap-3 justify-end">
            <UButton
              variant="ghost"
              :disabled="deleteAccountLoading"
              @click="showDeleteAccount = false"
            >
              取消
            </UButton>
            <UButton
              color="error"
              :loading="deleteAccountLoading"
              icon="i-lucide-trash-2"
              @click="handleDeleteAccount"
            >
              确认注销
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
