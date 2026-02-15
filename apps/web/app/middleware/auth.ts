export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    authStore.openAuthModal()
    return navigateTo(from.fullPath || '/', { replace: true })
  }
})
