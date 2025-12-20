import { biliFetch, config, err, json, preflight } from './_utils'

export { config }

const isBvid = (s: string) => /^BV[0-9A-Za-z]{10}$/.test(s)

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const u = new URL(req.url)
  const bvidsRaw = u.searchParams.get('bvids') ?? ''
  const bvids = bvidsRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => Boolean(s) && isBvid(s))
    .slice(0, 10)

  if (!bvids.length) return err('missing bvids', 400)

  const fetchOne = async (bvid: string) => {
    const res = await biliFetch(`https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`)
    if (!res.ok) return { bvid, error: true }
    const raw = await res.json().catch(() => null)
    if (!raw || raw?.code !== 0) return { bvid, error: true }
    const d = raw?.data ?? {}
    return {
      bvid,
      aid: Number(d.aid ?? 0),
      title: d.title ?? '',
      cover: d.pic ?? '',
      created: Number(d.pubdate ?? 0) * 1000,
      play: Number(d.stat?.view ?? 0),
      danmaku: Number(d.stat?.danmaku ?? 0),
      url: `https://www.bilibili.com/video/${bvid}`,
    }
  }

  // 避免一次性并发过多导致上游限流：按批次并发
  const results: any[] = []
  const batchSize = 3
  for (let i = 0; i < bvids.length; i += batchSize) {
    const batch = await Promise.all(bvids.slice(i, i + batchSize).map(fetchOne))
    results.push(...batch)
  }

  return json(
    { items: results.filter((r) => !r.error) },
    { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' } }
  )
}


