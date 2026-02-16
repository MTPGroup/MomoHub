export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/ui', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
