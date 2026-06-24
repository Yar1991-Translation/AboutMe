import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  // 用 card 接口替代 acc/info（acc/info 更容易触发风控返回 -401）
  const res = await biliFetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`, {
    headers: { Referer: 'https://space.bilibili.com/' },
  })
  if (!res.ok) return err('upstream error', 502)
  const raw = await res.json()
  if (raw?.code !== 0) return err(raw?.message ?? 'upstream error', 502)

  const card = raw?.data?.card ?? {}
  return json(
    {
      mid,
      name: card.name ?? '',
      face: card.face ?? '',
      sign: card.sign ?? '',
      level: card.level_info?.current_level ?? 0,
    },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
  )
}


