import { useEffect, useState } from 'react'
import { setTheme } from 'mdui/functions/setTheme'

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    setTheme(themeMode)
    localStorage.setItem('theme-mode', themeMode)
  }, [themeMode])

  return { themeMode, setThemeMode }
}
