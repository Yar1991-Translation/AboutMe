import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { applyTheme, type ThemeModeValue } from './md-theme'
import {
  getEffectiveSeason,
  getSeasonSeedColor,
  getStoredSeasonPreference,
  storeSeasonPreference,
  type SeasonPreference,
} from './season'

type ThemeContextValue = {
  themeMode: ThemeModeValue
  setThemeMode: (mode: ThemeModeValue) => void
  toggleThemeMode: () => void
  seasonPreference: SeasonPreference
  setSeasonPreference: (pref: SeasonPreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_MODE_KEY = 'theme-mode'

const getInitialThemeMode = (): ThemeModeValue => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_MODE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeModeValue>(getInitialThemeMode)
  const [seasonPreference, setSeasonPreferenceState] =
    useState<SeasonPreference>(getStoredSeasonPreference)

  // 季节偏好 -> 生效季节 -> 写 html[data-season] + 选种子色
  const seedColor = useMemo(() => {
    const effective = getEffectiveSeason(seasonPreference)
    if (typeof document !== 'undefined') {
      if (effective) document.documentElement.dataset.season = effective
      else delete document.documentElement.dataset.season
    }
    return getSeasonSeedColor(effective)
  }, [seasonPreference])

  // 种子色或亮暗变化时，重新生成并注入调色板
  useLayoutEffect(() => {
    applyTheme(seedColor, themeMode)
  }, [seedColor, themeMode])

  const setThemeMode = useCallback((mode: ThemeModeValue) => {
    setThemeModeState(mode)
    if (typeof window !== 'undefined') localStorage.setItem(THEME_MODE_KEY, mode)
  }, [])

  const toggleThemeMode = useCallback(() => {
    setThemeModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') localStorage.setItem(THEME_MODE_KEY, next)
      return next
    })
  }, [])

  const setSeasonPreference = useCallback((pref: SeasonPreference) => {
    setSeasonPreferenceState(pref)
    storeSeasonPreference(pref)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode,
      seasonPreference,
      setSeasonPreference,
    }),
    [themeMode, setThemeMode, toggleThemeMode, seasonPreference, setSeasonPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

// 供 main.tsx 在首帧前初始化，避免主题闪烁
export function initThemeBeforePaint() {
  const mode = getInitialThemeMode()
  const effective = getEffectiveSeason(getStoredSeasonPreference())
  if (typeof document !== 'undefined' && effective) {
    document.documentElement.dataset.season = effective
  }
  // 同步注入一次，避免首帧用默认紫色
  applyTheme(getSeasonSeedColor(effective), mode)
}
