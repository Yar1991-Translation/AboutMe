export interface SteamGame {
  title: string
  appId: number
  playtime: number // hours
  cover: string
  link: string
}

export interface RobloxGame {
  title: string
  gameId: number
  rootPlaceId: number
  thumbnail: string
  link: string
}

export interface RobloxProfile {
  userId: number
  name: string
  displayName: string
  avatarUrl: string
  followersCount: number
  followingCount: number
  friendsCount: number
  profileUrl: string
}

export interface MinecraftProfile {
  username: string
  uuid: string
  avatar: string
  head3d: string
  body: string
  skin: string
}

export interface GeneratedGames {
  steam: SteamGame[]
  roblox: RobloxGame[]
  robloxProfile: RobloxProfile | null
  minecraft: MinecraftProfile | null
  generatedAt: string | null
}




