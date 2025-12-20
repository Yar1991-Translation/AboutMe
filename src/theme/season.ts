export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type SeasonPreference = 'auto' | Season | 'off'

const STORAGE_KEY = 'season-preference'
export const DEFAULT_COLOR_SCHEME_SEED = '#6750a4'

export const getStoredSeasonPreference = (): SeasonPreference => {
  if (typeof window === 'undefined') return 'auto'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'auto' || v === 'off' || v === 'spring' || v === 'summer' || v === 'autumn' || v === 'winter') return v
  return 'auto'
}

export const storeSeasonPreference = (pref: SeasonPreference) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, pref)
}

const inferHemisphere = (): 'north' | 'south' => {
  // 仅用时区字符串做一个轻量推断，不申请地理定位权限
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  const southHints = [
    'Australia/',
    'Pacific/Auckland',
    'Pacific/Chatham',
    'America/Argentina',
    'America/Santiago',
    'America/Montevideo',
    'Africa/Johannesburg',
    'Africa/Windhoek',
  ]
  return southHints.some((h) => tz.startsWith(h) || tz.includes(h)) ? 'south' : 'north'
}

const seasonByMonth = (month1to12: number, hemisphere: 'north' | 'south'): Season => {
  // 北半球：春3-5 夏6-8 秋9-11 冬12-2
  // 南半球：反转
  const m = month1to12
  const north: Season =
    m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'
  if (hemisphere === 'north') return north
  return north === 'spring' ? 'autumn' : north === 'summer' ? 'winter' : north === 'autumn' ? 'spring' : 'summer'
}

export const getEffectiveSeason = (pref: SeasonPreference, now = new Date()): Season | null => {
  if (pref === 'off') return null
  if (pref !== 'auto') return pref
  const hemisphere = inferHemisphere()
  const month = now.getMonth() + 1
  return seasonByMonth(month, hemisphere)
}

export const getSeasonSeedColor = (season: Season | null): string => {
  if (!season) return DEFAULT_COLOR_SCHEME_SEED
  // 这些 seed 会交给 mdui 生成完整 MD3 palette（primary/secondary/surface 等都会跟着变）
  switch (season) {
    case 'spring':
      return '#22c55e'
    case 'summer':
      return '#f59e0b'
    case 'autumn':
      return '#f97316'
    case 'winter':
      return '#3b82f6'
    default:
      return DEFAULT_COLOR_SCHEME_SEED
  }
}





