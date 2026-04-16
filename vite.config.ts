import { heyApiPlugin } from '@hey-api/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    heyApiPlugin({
      config: {
        input: './openapi.json',
        output: 'src/client',
        plugins: ['@tanstack/react-query'],
      },
    }),
  ],
})

export default config
