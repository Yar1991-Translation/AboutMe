export type BiliProfile = {
  mid: number
  name: string
  face: string
  sign: string
  level: number
}

export type BiliStats = {
  mid: number
  following: number
  follower: number
  likes: number
  archiveView: number
}

export type BiliLive = {
  mid: number
  roomid: number
  liveStatus: boolean
  title: string
  url: string
}

export type BiliVideoItem = {
  bvid: string
  aid: number
  title: string
  cover: string
  created: number // ms
  play: number
  danmaku: number
  url: string
}

type ApiError = { error: true; message: string }

const memCache = new Map<string, { expiresAt: number; value: unknown }>()
const inFlight = new Map<string, Promise<unknown>>()

const API_BASE = (() => {
  const raw = import.meta.env.VITE_BILI_API_BASE as string | undefined
  const v = (raw ?? '').trim()
  return v.endsWith('/') ? v.slice(0, -1) : v
})()

const withBase = (path: string) => (API_BASE ? `${API_BASE}${path}` : path)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const cachedFetchJson = async <T>(url: string, ttlMs = 30_000): Promise<T> => {
  const now = Date.now()
  const hit = memCache.get(url)
  if (hit && hit.expiresAt > now) return hit.value as T

  const running = inFlight.get(url)
  if (running) return (await running) as T

  const run = (async () => {
    let lastErr: unknown = null
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { method: 'GET' })
        const data = (await res.json().catch(() => ({}))) as T | ApiError
        if (!res.ok || (data as ApiError)?.error) {
          const msg =
            (data as ApiError)?.message ??
            (res.status === 404 && !API_BASE
              ? 'B站 API 不可用：当前部署没有 /api（建议用 vercel 部署或设置 VITE_BILI_API_BASE 指向 Vercel 域名）'
              : `HTTP ${res.status}`)
          throw new Error(msg)
        }

        memCache.set(url, { expiresAt: Date.now() + ttlMs, value: data })
        return data as T
      } catch (e) {
        lastErr = e
        // 轻量重试：给网络波动/502 一个机会
        if (attempt === 0) await sleep(250)
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('B站数据加载失败')
  })()

  inFlight.set(url, run)
  try {
    return (await run) as T
  } finally {
    inFlight.delete(url)
  }

  // unreachable
}

export const biliApi = {
  profile: (mid: number) => cachedFetchJson<BiliProfile>(withBase(`/api/bili/profile?mid=${mid}`), 10 * 60_000),
  stats: (mid: number) => cachedFetchJson<BiliStats>(withBase(`/api/bili/stats?mid=${mid}`), 2 * 60_000),
  live: (mid: number) => cachedFetchJson<BiliLive>(withBase(`/api/bili/live?mid=${mid}`), 15_000),
  latest: (mid: number, ps: number) =>
    cachedFetchJson<{ mid: number; items: BiliVideoItem[] }>(withBase(`/api/bili/latest?mid=${mid}&ps=${ps}`), 60_000),
  videos: (bvids: string[]) =>
    cachedFetchJson<{ items: BiliVideoItem[] }>(withBase(`/api/bili/videos?bvids=${encodeURIComponent(bvids.join(','))}`), 6 * 60 * 60_000),
}


