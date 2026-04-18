import { Store, useStore } from '@tanstack/react-store'

type Theme = 'light' | 'dark' | 'system'

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('azusa-theme') as Theme) || 'system'
}

export const themeStore = new Store({
  theme: getStoredTheme(),
})

export const setTheme = (theme: Theme) => {
  themeStore.setState((state) => {
    localStorage.setItem('azusa-theme', theme)
    applyThemeToDOM(theme)
    return { ...state, theme }
  })
}

export function applyThemeToDOM(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  let actualTheme = theme
  if (theme === 'system') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  root.classList.add(actualTheme)
  root.style.colorScheme = actualTheme
}

export const useTheme = () => useStore(themeStore, (state) => state.theme)
