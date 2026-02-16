<template>
  <UDashboardSidebar collapsible resizable class="w-64">
    <template #header="{collapsed}">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
        <span class="text-green-500">Momo</span><span>Hub</span>
      </NuxtLink>
      <UBadge variant="subtle" size="sm">
        API Docs
      </UBadge>
    </template>

    <template #default="{collapsed}">
      <UNavigationMenu
      :collapsed="collapsed"
       :items="items" orientation="vertical" />
    </template>

    <template #footer="{collapsed}">
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          icon="i-lucide-github"
          to="https://github.com"
          target="_blank"
          aria-label="GitHub"
        />
        <UColorModeButton />
      </div>
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
const items = [
  [
    { label: 'Getting Started', icon: 'i-lucide-rocket', to: '/guide/getting-started' },
    { label: 'Authentication', icon: 'i-lucide-lock', to: '/guide/authentication' },
    { label: 'Error Handling', icon: 'i-lucide-alert-triangle', to: '/guide/error-handling' },
  ],
  [
    { label: 'Auth', icon: 'i-lucide-key-round', to: '/api/auth' },
    { label: 'Characters', icon: 'i-lucide-bot', to: '/api/characters' },
    { label: 'Knowledge', icon: 'i-lucide-book-open', to: '/api/knowledge' },
    { label: 'Chat', icon: 'i-lucide-message-square', to: '/api/chat' },
    { label: 'Plugins', icon: 'i-lucide-puzzle', to: '/api/plugins' },
  ],
]
</script>
