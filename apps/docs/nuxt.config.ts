export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],

  content: {
    preview: {
      api: 'https://api.nuxt.studio',
    },
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-01-15',
})
