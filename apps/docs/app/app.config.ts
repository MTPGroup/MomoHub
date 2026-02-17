export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
    },
    pageFeature: {
      slots: {
        root: 'relative rounded-lg border border-primary/30 p-4 transition-shadow hover:shadow-md hover:shadow-primary/10',
      },
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted',
      },
    },
  },
  seo: {
    siteName: 'MomoHub',
  },
  header: {
    title: 'MomoHub',
    to: '/',
    search: true,
    colorMode: true,
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/MTPGroup/MomoHub',
        target: '_blank',
        'aria-label': 'GitHub',
      },
    ],
  },
  footer: {
    credits: `MomoHub • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/MTPGroup/MomoHub',
        target: '_blank',
        'aria-label': 'MomoHub on GitHub',
      },
    ],
  },
  toc: {
    title: '目录',
    bottom: {
      title: '相关链接',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/MTPGroup/MomoHub',
          target: '_blank',
        },
      ],
    },
  },
})
