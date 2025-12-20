import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  const u = new URL(req.url)
  const ps = Math.min(Math.max(Number(u.searchParams.get('ps') ?? 6), 1), 20)

  // 用 series 接口替代 space/arc/search（arc/search 容易被限流返回 -799）
  const res = await biliFetch(
    `https://api.bilibili.com/x/series/recArchivesByKeywords?mid=${mid}&keywords=&pn=1&ps=${ps}`,
    { headers: { Referer: 'https://space.bilibili.com/' } }
  )
  if (!res.ok) return err('upstream error', 502)
  const raw = await res.json()
  if (raw?.code !== 0) return err(raw?.message ?? 'upstream error', 502)

  const list = raw?.data?.archives ?? []
  const mapped = list.map((it: any) => ({
    bvid: it?.bvid ?? '',
    aid: Number(it?.aid ?? 0),
    title: it?.title ?? '',
    cover: it?.pic ?? '',
    created: Number(it?.pubdate ?? 0) * 1000,
    play: Number(it?.stat?.view ?? 0),
    danmaku: 0,
    url: it?.bvid ? `https://www.bilibili.com/video/${it.bvid}` : '',
  }))

  return json({ mid, items: mapped }, { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=600' } })
}


