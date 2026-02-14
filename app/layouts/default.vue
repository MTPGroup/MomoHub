<script setup lang="ts">
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain>
      <slot />
    </UMain>
    <AppFooter />
    <AppAuthModal
      :model-value="authStore.showAuthModal"
      @update:model-value="authStore.showAuthModal = $event"
    />
  </UApp>
</template>
