<script setup lang="ts">
import { getApiErrorCode, getApiErrorMessage, OtpType } from '@momohub/types'

const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED'

const authStore = useAuthStore()

const open = defineModel<boolean>({ default: false })

const mode = ref<'login' | 'register' | 'verify' | 'forgot' | 'reset-password'>(
  'login',
)

// 监听登录状态变化，退出登录后自动清空表单
watch(
  () => authStore.isLoggedIn,
  (isLoggedIn, wasLoggedIn) => {
    // 从登录状态变为未登录状态时，清空表单
    if (wasLoggedIn && !isLoggedIn) {
      resetForm()
    }
  },
)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  otp: '',
  newPassword: '',
  confirmNewPassword: '',
})

const loading = ref(false)
const resending = ref(false)
const error = ref('')
const successMsg = ref('')

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.otp = ''
  form.newPassword = ''
  form.confirmNewPassword = ''
  error.value = ''
  successMsg.value = ''
}

const switchMode = (newMode: 'login' | 'register') => {
  mode.value = newMode
  resetForm()
}

watch(open, (val) => {
  if (!val) {
    resetForm()
    mode.value = 'login'
  }
})

const enterVerifyMode = async (email: string) => {
  mode.value = 'verify'
  form.email = email
  form.otp = ''
  error.value = ''
  successMsg.value = ''
  try {
    await authStore.sendOtp({ email, type: OtpType.VERIFY_EMAIL })
    successMsg.value = '验证码已发送至你的邮箱，请查收'
  } catch (e) {
    error.value = getApiErrorMessage(e, '发送验证码失败')
  }
}

const handleResendOtp = async () => {
  resending.value = true
  error.value = ''
  successMsg.value = ''
  const otpType =
    mode.value === 'reset-password'
      ? OtpType.RESET_PASSWORD
      : OtpType.VERIFY_EMAIL
  try {
    const response = await authStore.sendOtp({
      email: form.email,
      type: otpType,
    })
    if (response.success) {
      successMsg.value = '验证码已重新发送，请查看邮箱'
    } else {
      error.value = response.message || '发送失败'
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '发送验证码失败')
  } finally {
    resending.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''
  successMsg.value = ''

  if (mode.value === 'register' && form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (
    mode.value === 'reset-password' &&
    form.newPassword !== form.confirmNewPassword
  ) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      const response = await authStore.login({
        email: form.email,
        password: form.password,
      })
      if (response.success) {
        resetForm()
        open.value = false
      } else if (response.code === EMAIL_NOT_VERIFIED_CODE) {
        await enterVerifyMode(form.email)
        return
      } else {
        error.value = response.message || '登录失败'
      }
    } else if (mode.value === 'register') {
      const response = await authStore.register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      if (response.success) {
        mode.value = 'verify'
        form.password = ''
        form.confirmPassword = ''
        successMsg.value = '注册成功！验证码已发送至你的邮箱'
      } else {
        error.value = response.message || '注册失败'
      }
    } else if (mode.value === 'verify') {
      const response = await authStore.verifyEmail({
        email: form.email,
        otp: form.otp,
      })
      if (response.success) {
        mode.value = 'login'
        resetForm()
        successMsg.value = '邮箱验证成功，请登录'
      } else {
        error.value = response.message || '验证失败'
      }
    } else if (mode.value === 'forgot') {
      const response = await authStore.sendOtp({
        email: form.email,
        type: OtpType.RESET_PASSWORD,
      })
      if (response.success) {
        mode.value = 'reset-password'
        form.otp = ''
        form.newPassword = ''
        form.confirmNewPassword = ''
        successMsg.value = '验证码已发送至你的邮箱'
      } else {
        error.value = response.message || '发送失败'
      }
    } else if (mode.value === 'reset-password') {
      const response = await authStore.resetPassword({
        email: form.email,
        otp: form.otp,
        password: form.newPassword,
      })
      if (response.success) {
        mode.value = 'login'
        resetForm()
        successMsg.value = '密码重置成功，请登录'
      } else {
        error.value = response.message || '重置失败'
      }
    }
  } catch (e) {
    if (
      mode.value === 'login' &&
      getApiErrorCode(e) === EMAIL_NOT_VERIFIED_CODE
    ) {
      await enterVerifyMode(form.email)
      return
    }
    const fallbacks = {
      login: '登录失败',
      register: '注册失败',
      verify: '验证失败',
      forgot: '发送验证码失败',
      'reset-password': '重置密码失败',
    } satisfies Record<typeof mode.value, string>
    error.value = getApiErrorMessage(e, fallbacks[mode.value])
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
            {{
              {
                login: '登录',
                register: '注册',
                verify: '验证邮箱',
                forgot: '忘记密码',
                'reset-password': '重置密码',
              }[mode]
            }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{
              {
                login: '登录你的 MomoHub 账号',
                register: '创建你的 MomoHub 账号',
                verify: `验证码已发送至 ${form.email}`,
                forgot: '输入注册邮箱以接收验证码',
                'reset-password': `验证码已发送至 ${form.email}`,
              }[mode]
            }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UAlert
            v-if="error"
            color="error"
            :title="error"
            icon="i-lucide-alert-circle"
          />

          <UAlert
            v-if="successMsg"
            color="success"
            :title="successMsg"
            icon="i-lucide-check-circle"
          />

          <!-- 注册表单 -->
          <template v-if="mode === 'register'">
            <UFormField label="用户名">
              <UInput
                v-model="form.name"
                placeholder="输入用户名"
                icon="i-lucide-user"
                required
                class="w-full"
              />
            </UFormField>
          </template>

          <!-- 邮箱输入（登录、注册、忘记密码） -->
          <UFormField
            v-if="mode === 'login' || mode === 'register' || mode === 'forgot'"
            label="邮箱"
          >
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              icon="i-lucide-mail"
              required
              class="w-full"
            />
          </UFormField>

          <!-- 密码输入（登录、注册） -->
          <UFormField
            v-if="mode === 'login' || mode === 'register'"
            label="密码"
          >
            <UInput
              v-model="form.password"
              type="password"
              placeholder="输入密码"
              icon="i-lucide-lock"
              required
              class="w-full"
            />
          </UFormField>

          <!-- 注册确认密码 -->
          <UFormField v-if="mode === 'register'" label="确认密码">
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              icon="i-lucide-lock"
              required
              class="w-full"
            />
          </UFormField>

          <!-- 邮箱验证码输入 -->
          <template v-if="mode === 'verify' || mode === 'reset-password'">
            <UFormField label="验证码">
              <UInput
                v-model="form.otp"
                placeholder="输入邮箱验证码"
                icon="i-lucide-key-round"
                required
                class="w-full"
              />
            </UFormField>

            <div class="text-right">
              <UButton
                variant="link"
                size="xs"
                :loading="resending"
                @click="handleResendOtp"
              >
                重新发送验证码
              </UButton>
            </div>
          </template>

          <!-- 重置密码：新密码输入 -->
          <template v-if="mode === 'reset-password'">
            <UFormField label="新密码">
              <UInput
                v-model="form.newPassword"
                type="password"
                placeholder="输入新密码"
                icon="i-lucide-lock"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField label="确认新密码">
              <UInput
                v-model="form.confirmNewPassword"
                type="password"
                placeholder="再次输入新密码"
                icon="i-lucide-lock"
                required
                class="w-full"
              />
            </UFormField>
          </template>

          <UButton type="submit" block size="lg" :loading="loading">
            {{
              {
                login: '登录',
                register: '注册',
                verify: '验证',
                forgot: '发送验证码',
                'reset-password': '重置密码',
              }[mode]
            }}
          </UButton>
        </form>

        <div class="text-sm text-center text-gray-500 mt-4 space-y-1">
          <template v-if="mode === 'login'">
            <p>
              还没有账号？
              <UButton
                variant="link"
                size="xs"
                class="p-0"
                @click="switchMode('register')"
              >
                立即注册
              </UButton>
            </p>
            <p>
              <UButton
                variant="link"
                size="xs"
                class="p-0"
                @click="
                  () => {
                    mode = 'forgot'
                    error = ''
                    successMsg = ''
                  }
                "
              >
                忘记密码？
              </UButton>
            </p>
          </template>
          <template v-if="mode === 'register'">
            <p>
              已有账号？
              <UButton
                variant="link"
                size="xs"
                class="p-0"
                @click="switchMode('login')"
              >
                立即登录
              </UButton>
            </p>
          </template>
          <template
            v-if="
              mode === 'verify' ||
              mode === 'forgot' ||
              mode === 'reset-password'
            "
          >
            <p>
              <UButton
                variant="link"
                size="xs"
                class="p-0"
                @click="switchMode('login')"
              >
                返回登录
              </UButton>
            </p>
          </template>
        </div>
      </div>
    </template>
  </UModal>
</template>
