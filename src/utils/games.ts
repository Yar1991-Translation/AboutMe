import type { GeneratedGames, SteamGame } from '../types/games'

export const selectSteamTop = (gameData: GeneratedGames, limit = 6): SteamGame[] => {
  const list = gameData.steam ?? []
  return list.slice(0, limit)
}
