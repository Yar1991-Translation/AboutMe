import { useEffect, useState } from 'react'
import { setColorScheme } from 'mdui/functions/setColorScheme'
import {
  getEffectiveSeason,
  getSeasonSeedColor,
  getStoredSeasonPreference,
  storeSeasonPreference,
  type SeasonPreference,
} from '../theme/season'

export const useSeasonPreference = () => {
  const [seasonPreference, setSeasonPreference] = useState<SeasonPreference>(getStoredSeasonPreference)

  useEffect(() => {
    storeSeasonPreference(seasonPreference)
    const effective = getEffectiveSeason(seasonPreference)
    if (effective) document.documentElement.dataset.season = effective
    else delete document.documentElement.dataset.season
    setColorScheme(getSeasonSeedColor(effective))
  }, [seasonPreference])

  return { seasonPreference, setSeasonPreference }
}
