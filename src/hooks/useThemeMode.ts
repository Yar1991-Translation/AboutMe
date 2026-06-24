import { useTheme } from '@/theme/ThemeProvider'

/**
 * 亮/暗模式。底层状态由 ThemeProvider 统一管理。
 */
export const useThemeMode = () => {
  const { themeMode, setThemeMode } = useTheme()
  return { themeMode, setThemeMode }
}
