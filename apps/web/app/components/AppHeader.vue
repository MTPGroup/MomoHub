<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const authStore = useAuthStore()
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  { label: '首页', icon: 'i-lucide-home', to: '/' },
  {
    label: '角色',
    icon: 'i-lucide-users',
    to: '/characters',
    active: route.path.startsWith('/characters'),
  },
  {
    label: '插件',
    icon: 'i-lucide-puzzle',
    to: '/plugins',
    active: route.path.startsWith('/plugins'),
  },
  {
    label: '知识库',
    icon: 'i-lucide-book-open',
    to: '/knowledge',
    active: route.path.startsWith('/knowledge'),
  },
])

const userMenuItems = computed(() => [
  [
    {
      label: '个人中心',
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ],
  [
    {
      label: '退出登录',
      icon: 'i-lucide-log-out',
      onSelect: () => authStore.logout(),
    },
  ],
])
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtLink to="/">
        <span class="text-primary">Momo</span><span>Hub</span>
        <!-- <AppLogo class="w-auto h-6 shrink-0" /> -->
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UButton
        to="https://github.com/MTPGroup/MomoHub"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />

      <template v-if="authStore.isLoggedIn">
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            :label="authStore.user?.username"
            icon="i-lucide-user"
          />
        </UDropdownMenu>
      </template>
      <template v-else>
        <UButton
          variant="ghost"
          color="neutral"
          @click="authStore.openAuthModal"
        >
          登录
        </UButton>
      </template>
    </template>
  </UHeader>
</template>
