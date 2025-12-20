import { biliFetch, config, err, getMid, json, preflight } from './_utils'

export { config }

export default async function handler(req: Request): Promise<Response> {
  const pf = preflight(req)
  if (pf) return pf
  if (req.method !== 'GET') return err('method not allowed', 405)

  const mid = getMid(req)
  if (!mid) return err('missing mid', 400)

  const res = await biliFetch(`https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${mid}`)
  if (!res.ok) return err('upstream error', 502)
  const raw = await res.json()
  if (raw?.code !== 0) return err(raw?.message ?? 'upstream error', 502)

  const d = raw?.data ?? {}
  const roomid = Number(d.roomid ?? 0)
  const liveStatus = Number(d.liveStatus ?? 0) === 1

  return json(
    {
      mid,
      roomid,
      liveStatus,
      title: d.title ?? '',
      url: roomid ? `https://live.bilibili.com/${roomid}` : '',
    },
    { headers: { 'Cache-Control': 's-maxage=20, stale-while-revalidate=60' } }
  )
}


