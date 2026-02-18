// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit',
  ],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1,
        },
      },
    },
  },

  experimental: {
    asyncContext: true,
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  icon: {
    provider: 'iconify',
  },

  llms: {
    domain: 'https://momohub-docs.hanasaki.tech',
    title: 'MomoHub API',
    description:
      'MomoHub AI 角色平台 API 参考文档，支持角色管理、知识库、插件和多轮对话。',
    full: {
      title: 'MomoHub API - 完整文档',
      description:
        'MomoHub AI 角色平台完整 API 文档，包含认证、角色管理、知识库、对话和插件系统。',
    },
    sections: [
      {
        title: '指南',
        contentCollection: 'docs',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/guide%' }],
      },
      {
        title: 'API 参考',
        contentCollection: 'docs',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/api%' }],
      },
    ],
  },

  mcp: {
    name: 'MomoHub API',
    version: '1.0.0',
  },
})
