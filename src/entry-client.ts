import { applyThemeToDOM, themeStore } from './stores/theme'

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    const currentTheme = themeStore.state.theme
    if (currentTheme === 'system') {
      applyThemeToDOM('system')
    }
  })

// 首次加载立即应用一次，确保同步
applyThemeToDOM(themeStore.state.theme)
