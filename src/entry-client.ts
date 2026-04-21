import { applyThemeToDOM, themeStore } from './stores/theme'

function syncThemeClassToDom() {
  applyThemeToDOM(themeStore.state.theme)
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    const currentTheme = themeStore.state.theme
    if (currentTheme === 'system') {
      applyThemeToDOM('system')
    }
  })

// 首次加载立即应用一次，确保同步
syncThemeClassToDom()

// 在 hydration 后再次同步，避免 html class 在对齐阶段被覆盖。
window.setTimeout(syncThemeClassToDom, 0)
