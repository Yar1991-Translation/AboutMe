export const config = { runtime: 'edge' }

const corsHeaders = () =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }) as const

export const preflight = (req: Request): Response | null => {
  if (req.method !== 'OPTIONS') return null
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export const json = (data: unknown, init?: ResponseInit) => {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  // 允许跨域：支持 GitHub Pages 静态站调用 Vercel API
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v)
  // Vercel Edge 缓存：可被 CDN 缓存，降低 B站压力
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export const err = (message: string, status = 500) => json({ error: true, message }, { status })

export const getMid = (req: Request): number | null => {
  const u = new URL(req.url)
  const mid = u.searchParams.get('mid')
  if (!mid) return null
  const n = Number(mid)
  return Number.isFinite(n) && n > 0 ? n : null
}

export const biliFetch = async (url: string, init?: RequestInit & { timeoutMs?: number }) => {
  // 部分接口会对 UA/Referer 更敏感
  const timeoutMs = init?.timeoutMs ?? 8000
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)

  const res = await fetch(url, {
    ...init,
    signal: ctrl.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://www.bilibili.com/',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  clearTimeout(t)
  return res
}


