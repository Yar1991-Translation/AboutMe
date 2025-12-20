import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  const res = await biliFetch(`https://api.bilibili.com/x/space/acc/info?mid=${mid}&jsonp=jsonp`)
  if (!res.ok) return err('upstream error', 502)
  const raw = await res.json()
  if (raw?.code !== 0) return err(raw?.message ?? 'upstream error', 502)

  const d = raw?.data ?? {}
  return json(
    {
      mid,
      name: d.name ?? '',
      face: d.face ?? '',
      sign: d.sign ?? '',
      level: d.level ?? 0,
    },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
  )
}


