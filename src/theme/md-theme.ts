/**
 * 运行时主题引擎：从季节种子色生成完整 MD3 调色板，并写入 CSS 变量。
 *
 * 同时注入两套变量：
 *  - `--md-sys-color-*`（hex）   → 驱动 @material/web 组件
 *  - `--mdui-color-*`（"r, g, b"）→ 过渡期兼容旧 App.css / mdui 组件
 *
 * 替代 mdui 的 setTheme / setColorScheme（@material/web 不在运行时生成调色板）。
 */
import {
  themeFromSourceColor,
  argbFromHex,
  redFromArgb,
  greenFromArgb,
  blueFromArgb,
} from '@material/material-color-utilities'

export type ThemeModeValue = 'light' | 'dark'

/** MD3 surface-container 体系基于 neutral palette 的 tone（亮/暗不同） */
const SURFACE_TONES: Record<ThemeModeValue, Record<string, number>> = {
  light: {
    surfaceDim: 87,
    surfaceBright: 98,
    surfaceContainerLowest: 100,
    surfaceContainerLow: 96,
    surfaceContainer: 94,
    surfaceContainerHigh: 92,
    surfaceContainerHighest: 90,
  },
  dark: {
    surfaceDim: 6,
    surfaceBright: 24,
    surfaceContainerLowest: 4,
    surfaceContainerLow: 10,
    surfaceContainer: 12,
    surfaceContainerHigh: 17,
    surfaceContainerHighest: 22,
  },
}

const camelToKebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const toHex = (argb: number) => {
  const r = redFromArgb(argb)
  const g = greenFromArgb(argb)
  const b = blueFromArgb(argb)
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

const toRgbTriplet = (argb: number) =>
  `${redFromArgb(argb)}, ${greenFromArgb(argb)}, ${blueFromArgb(argb)}`

/**
 * 根据种子色与亮暗模式生成 MD3 角色表（role -> argb）。
 */
const buildRoles = (seedHex: string, mode: ThemeModeValue): Record<string, number> => {
  const theme = themeFromSourceColor(argbFromHex(seedHex))
  const scheme = theme.schemes[mode]
  const roles: Record<string, number> = { ...scheme.toJSON() }

  // 补全 surface-container 体系（旧 Scheme 不含）
  const neutral = theme.palettes.neutral
  for (const [role, tone] of Object.entries(SURFACE_TONES[mode])) {
    roles[role] = neutral.tone(tone)
  }
  // surface-tint 约定为 primary
  roles.surfaceTint = roles.primary

  return roles
}

/**
 * 应用主题：写入 --md-sys-color-* 与 --mdui-color-* 两套变量。
 */
export const applyTheme = (seedHex: string, mode: ThemeModeValue) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const roles = buildRoles(seedHex, mode)

  for (const [camelRole, argb] of Object.entries(roles)) {
    const kebab = camelToKebab(camelRole)
    root.style.setProperty(`--md-sys-color-${kebab}`, toHex(argb))
    root.style.setProperty(`--mdui-color-${kebab}`, toRgbTriplet(argb))
  }

  root.dataset.themeMode = mode
  root.style.colorScheme = mode
}
