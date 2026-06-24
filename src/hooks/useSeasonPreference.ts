import { useTheme } from '@/theme/ThemeProvider'

/**
 * 季节配色偏好。底层状态由 ThemeProvider 统一管理。
 */
export const useSeasonPreference = () => {
  const { seasonPreference, setSeasonPreference } = useTheme()
  return { seasonPreference, setSeasonPreference }
}
