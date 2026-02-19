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
      color: 'error',
      onSelect: () => authStore.logout(),
    },
  ],
])
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtLink to="/" aria-label="MomoHub">
        <span class="text-primary">Momo</span><span>Hub</span>
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
            variant="ghost"
            color="neutral"
            class="p-0.5 rounded-full"
            :ui="{ base: 'hover:bg-transparent focus-visible:ring-0' }"
          >
            <ClientOnly>
              <UAvatar
                :src="authStore.user?.avatar || undefined"
                :alt="authStore.user?.username"
                :text="authStore.user?.username?.[0] ?? 'U'"
                size="md"
                class="ring-2 ring-transparent hover:ring-primary transition-all"
              />
              <template #fallback>
                <USkeleton class="h-10 w-10 rounded-full" />
              </template>
            </ClientOnly>
          </UButton>
        </UDropdownMenu>
      </template>
      <template v-else>
        <UAvatar
          text="登录"
          size="sm"
          class="hover:border-primary hover:border"
          @click="authStore.openAuthModal"
        />
      </template>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
