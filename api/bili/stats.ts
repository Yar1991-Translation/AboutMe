import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  const [relRes, upstatRes] = await Promise.all([
    biliFetch(`https://api.bilibili.com/x/relation/stat?vmid=${mid}`),
    biliFetch(`https://api.bilibili.com/x/space/upstat?mid=${mid}`),
  ])

  if (!relRes.ok || !upstatRes.ok) return err('upstream error', 502)

  const rel = await relRes.json()
  const upstat = await upstatRes.json()

  if (rel?.code !== 0) return err(rel?.message ?? 'upstream error', 502)
  if (upstat?.code !== 0) return err(upstat?.message ?? 'upstream error', 502)

  return json(
    {
      mid,
      following: Number(rel?.data?.following ?? 0),
      follower: Number(rel?.data?.follower ?? 0),
      likes: Number(upstat?.data?.likes ?? 0),
      archiveView: Number(upstat?.data?.archive?.view ?? 0),
    },
    { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=3600' } }
  )
}


