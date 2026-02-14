<script setup lang="ts">
import { getApiErrorMessage } from '~/types'

const authStore = useAuthStore()

const open = defineModel<boolean>({ default: false })

const mode = ref<'login' | 'register'>('login')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  error.value = ''
}

const switchMode = (newMode: 'login' | 'register') => {
  mode.value = newMode
  resetForm()
}

watch(open, (val) => {
  if (!val) resetForm()
})

const handleSubmit = async () => {
  error.value = ''

  if (mode.value === 'register' && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      const response = await authStore.login({
        email: form.email,
        password: form.password
      })
      if (response.success) {
        open.value = false
      } else {
        error.value = response.message || '登录失败'
      }
    } else {
      const response = await authStore.register({
        name: form.name,
        email: form.email,
        password: form.password
      })
      if (response.success) {
        open.value = false
      } else {
        error.value = response.message || '注册失败'
      }
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, mode.value === 'login' ? '登录失败' : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold">
            {{ mode === 'login' ? '登录' : '注册' }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ mode === 'login' ? '登录你的 MomoHub 账号' : '创建你的 MomoHub 账号' }}
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <UAlert
            v-if="error"
            color="error"
            :title="error"
            icon="i-lucide-alert-circle"
          />

          <UFormField
            v-if="mode === 'register'"
            label="用户名"
          >
            <UInput
              v-model="form.name"
              placeholder="输入用户名"
              icon="i-lucide-user"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="邮箱">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              icon="i-lucide-mail"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="密码">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="输入密码"
              icon="i-lucide-lock"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="mode === 'register'"
            label="确认密码"
          >
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              icon="i-lucide-lock"
              required
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            {{ mode === 'login' ? '登录' : '注册' }}
          </UButton>
        </form>

        <p class="text-sm text-center text-gray-500 mt-4">
          <template v-if="mode === 'login'">
            还没有账号？
            <UButton
              variant="link"
              size="xs"
              class="p-0"
              @click="switchMode('register')"
            >
              立即注册
            </UButton>
          </template>
          <template v-else>
            已有账号？
            <UButton
              variant="link"
              size="xs"
              class="p-0"
              @click="switchMode('login')"
            >
              立即登录
            </UButton>
          </template>
        </p>
      </div>
    </template>
  </UModal>
</template>
