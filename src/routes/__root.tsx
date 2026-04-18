import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { Footer } from '#/components/layout/footer'
import { Header } from '#/components/layout/header'
import { env } from '#/env'
import appCss from '#/styles.css?url'

interface MomohubRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `
  (function() {
    try {
      var theme = localStorage.getItem('azusa-theme') || 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var actual = isDark ? 'dark' : 'light';
      document.documentElement.classList.add(actual);
      document.documentElement.style.colorScheme = actual;
    } catch (e) {}
  })()

`

export const Route = createRootRouteWithContext<MomohubRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: env.VITE_APP_TITLE ?? 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 主题初始化脚本是安全的 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className='font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)] flex min-h-screen flex-col'>
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
        <Toaster />
        <TanStackDevtools
          plugins={[
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'TanStack Form',
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
