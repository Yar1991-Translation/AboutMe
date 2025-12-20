import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = `${__dirname}/../src/data/generated-games.json`

// ============ Steam API ============
async function fetchSteamGames() {
  const apiKey = process.env.STEAM_API_KEY
  const steamId = process.env.STEAM_ID

  if (!apiKey || !steamId) {
    console.log('⚠️  Steam: 缺少 API Key 或 Steam ID，跳过')
    return []
  }

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
    const res = await fetch(url)
    const data = await res.json()

    if (!data.response?.games) {
      console.log('⚠️  Steam: 无法获取游戏列表')
      return []
    }

    // 按游玩时长排序，取前 20 个
    const games = data.response.games
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 20)
      .map(game => ({
        title: game.name,
        appId: game.appid,
        playtime: Math.round(game.playtime_forever / 60), // 转换为小时
        cover: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`,
        link: `https://store.steampowered.com/app/${game.appid}`
      }))

    console.log(`✅ Steam: 获取到 ${games.length} 个游戏`)
    return games
  } catch (error) {
    console.error('❌ Steam API 错误:', error.message)
    return []
  }
}

// ============ Roblox API ============
async function fetchRobloxFavorites() {
  const userId = process.env.ROBLOX_USER_ID

  if (!userId) {
    console.log('⚠️  Roblox: 缺少 User ID，跳过')
    return []
  }

  try {
    // 获取收藏的游戏
    const url = `https://games.roblox.com/v2/users/${userId}/favorite/games?sortOrder=Desc&limit=25`
    const res = await fetch(url)
    const data = await res.json()

    if (!data.data || data.data.length === 0) {
      console.log('⚠️  Roblox: 无收藏游戏')
      return []
    }

    // universeId 列表
    const universeIds = data.data.map(g => g.id).join(',')

    // 获取 rootPlaceId（favorites 接口可能不返回该字段）
    const detailsRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds}`)
    const detailsData = await detailsRes.json()
    const rootPlaceMap = {}
    if (detailsData?.data) {
      detailsData.data.forEach(g => {
        rootPlaceMap[g.id] = g.rootPlaceId
      })
    }

    // 获取游戏缩略图
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
    )
    const thumbData = await thumbRes.json()

    const thumbnailMap = {}
    if (thumbData.data) {
      thumbData.data.forEach(t => {
        thumbnailMap[t.targetId] = t.imageUrl
      })
    }

    const games = data.data.map(game => ({
      title: game.name,
      gameId: game.id,
      rootPlaceId: rootPlaceMap[game.id] ?? game.rootPlaceId,
      thumbnail: thumbnailMap[game.id] || '',
      link: `https://www.roblox.com/games/${rootPlaceMap[game.id] ?? game.rootPlaceId}`
    }))

    console.log(`✅ Roblox: 获取到 ${games.length} 个收藏游戏`)
    return games
  } catch (error) {
    console.error('❌ Roblox API 错误:', error.message)
    return []
  }
}

async function fetchRobloxProfile() {
  const userId = process.env.ROBLOX_USER_ID

  if (!userId) {
    console.log('⚠️  Roblox: 缺少 User ID，跳过资料卡')
    return null
  }

  try {
    const [userRes, avatarRes, followersRes, followingRes, friendsRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userId}`),
      fetch(
        `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png&isCircular=false`
      ),
      fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      fetch(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
    ])

    if (!userRes.ok) {
      console.log('⚠️  Roblox: 用户资料获取失败')
      return null
    }

    const user = await userRes.json()
    const avatarData = await avatarRes.json().catch(() => ({}))
    const followersData = await followersRes.json().catch(() => ({}))
    const followingData = await followingRes.json().catch(() => ({}))
    const friendsData = await friendsRes.json().catch(() => ({}))

    const avatarUrl = avatarData?.data?.[0]?.imageUrl ?? ''

    const profile = {
      userId: Number(user.id ?? userId),
      name: user.name ?? '',
      displayName: user.displayName ?? user.name ?? '',
      avatarUrl,
      followersCount: Number(followersData?.count ?? 0),
      followingCount: Number(followingData?.count ?? 0),
      friendsCount: Number(friendsData?.count ?? 0),
      profileUrl: `https://www.roblox.com/users/${user.id ?? userId}/profile`,
    }

    console.log(`✅ Roblox: 获取到资料卡 ${profile.displayName} (@${profile.name})`)
    return profile
  } catch (error) {
    console.error('❌ Roblox Profile API 错误:', error.message)
    return null
  }
}

// ============ Minecraft API ============
async function fetchMinecraftProfile() {
  const username = process.env.MINECRAFT_USERNAME

  if (!username) {
    console.log('⚠️  Minecraft: 缺少 Username，跳过')
    return null
  }

  try {
    // 通过用户名获取 UUID
    const profileRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    
    if (!profileRes.ok) {
      console.log('⚠️  Minecraft: 用户名无效或不存在')
      return null
    }

    const profile = await profileRes.json()
    const uuid = profile.id

    // 生成各种图片 URL (使用 Crafatar)
    const result = {
      username: profile.name,
      uuid: uuid,
      avatar: `https://crafatar.com/avatars/${uuid}?size=128&overlay`,
      head3d: `https://crafatar.com/renders/head/${uuid}?scale=6&overlay`,
      body: `https://crafatar.com/renders/body/${uuid}?scale=6&overlay`,
      skin: `https://crafatar.com/skins/${uuid}`
    }

    console.log(`✅ Minecraft: 获取到玩家 ${result.username}`)
    return result
  } catch (error) {
    console.error('❌ Minecraft API 错误:', error.message)
    return null
  }
}

// ============ 主函数 ============
async function main() {
  console.log('🎮 开始获取游戏数据...\n')

  const [steam, roblox, robloxProfile, minecraft] = await Promise.all([
    fetchSteamGames(),
    fetchRobloxFavorites(),
    fetchRobloxProfile(),
    fetchMinecraftProfile()
  ])

  const result = {
    steam,
    roblox,
    robloxProfile,
    minecraft,
    generatedAt: new Date().toISOString()
  }

  // 确保目录存在
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  
  // 写入 JSON 文件
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8')

  console.log(`\n📁 数据已写入: ${OUTPUT_PATH}`)
  console.log(`   - Steam: ${steam.length} 个游戏`)
  console.log(`   - Roblox: ${roblox.length} 个收藏`)
  console.log(`   - Roblox资料卡: ${robloxProfile ? '已获取' : '未配置/失败'}`)
  console.log(`   - Minecraft: ${minecraft ? '已获取' : '未配置'}`)
}

main().catch(console.error)




