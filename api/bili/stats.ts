import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  // 统一用 card 接口拿关注/粉丝/获赞（upstat 在部分网络环境会返回 data:{}）
  const res = await biliFetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}&photo=true`, {
    headers: { Referer: 'https://space.bilibili.com/' },
  })
  if (!res.ok) return err('upstream error', 502)
  const raw = await res.json()
  if (raw?.code !== 0) return err(raw?.message ?? 'upstream error', 502)

  const card = raw?.data?.card ?? {}
  const likeNum = Number(raw?.data?.like_num ?? 0)

  return json(
    {
      mid,
      following: Number(card.attention ?? 0),
      follower: Number(card.fans ?? 0),
      likes: likeNum,
      // card 不提供总播放量；保持 0（前端只用到 likes/follower/following）
      archiveView: 0,
    },
    { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=3600' } }
  )
}


