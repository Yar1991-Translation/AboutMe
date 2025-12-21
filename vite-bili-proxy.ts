import type { Plugin } from 'vite'

// 本地开发时模拟 Vercel API 函数，直接调用 B站 API
export function biliApiProxy(): Plugin {
  return {
    name: 'bili-api-proxy',
    configureServer(server) {
      // 开发期工具：这里不做严格类型建模，避免 CI/tsc 因 JSON 类型推断为 {} 而报错
      const biliFetch = async (url: string): Promise<any> => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.bilibili.com/',
            'Accept': 'application/json',
          },
        })
        return (await res.json()) as any
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/bili/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const mid = url.searchParams.get('mid')
        const ps = url.searchParams.get('ps') || '6'
        const bvids = url.searchParams.get('bvids')

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        try {
          let data: unknown = {}

          if (req.url.startsWith('/api/bili/profile')) {
            // 使用 card API 代替 acc/info（避免反爬虫）
            const raw: any = await biliFetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`)
            const card = raw?.data?.card ?? {}
            data = {
              mid: Number(mid),
              name: card.name ?? '',
              face: card.face ?? '',
              sign: card.sign ?? '',
              level: card.level_info?.current_level ?? 0,
            }
          } else if (req.url.startsWith('/api/bili/stats')) {
            // 使用 card API 获取所有数据（避免多次请求被限制）
            const cardRaw: any = await biliFetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}&photo=true`)
            const card = cardRaw?.data?.card ?? {}
            const likeNum = cardRaw?.data?.like_num ?? 0
            data = {
              mid: Number(mid),
              following: card.attention ?? 0,
              follower: card.fans ?? 0,
              likes: likeNum,
              archiveView: 0,
            }
          } else if (req.url.startsWith('/api/bili/live')) {
            const raw: any = await biliFetch(`https://api.bilibili.com/x/space/acc/info?mid=${mid}&jsonp=jsonp`)
            const live = raw?.data?.live_room ?? {}
            data = {
              mid: Number(mid),
              roomid: live.roomid ?? 0,
              liveStatus: live.liveStatus === 1,
              title: live.title ?? '',
              url: live.url ?? '',
            }
          } else if (req.url.startsWith('/api/bili/latest')) {
            // 使用 series API 获取视频列表（避免反爬虫）
            const raw: any = await biliFetch(
              `https://api.bilibili.com/x/series/recArchivesByKeywords?mid=${mid}&keywords=&ps=${ps}&pn=1`
            )
            const list = raw?.data?.archives ?? []
            data = {
              mid: Number(mid),
              items: list.map((v: Record<string, unknown>) => ({
                bvid: v.bvid,
                aid: v.aid,
                title: v.title,
                cover: v.pic,
                created: (v.pubdate as number) * 1000,
                play: (v.stat as Record<string, unknown>)?.view ?? 0,
                danmaku: 0,
                url: `https://www.bilibili.com/video/${v.bvid}`,
              })),
            }
          } else if (req.url.startsWith('/api/bili/videos') && bvids) {
            const bvidList = bvids.split(',')
            const items = await Promise.all(
              bvidList.map(async (bvid) => {
                const raw: any = await biliFetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)
                const v = raw?.data ?? {}
                return {
                  bvid: v.bvid,
                  aid: v.aid,
                  title: v.title,
                  cover: v.pic,
                  created: (v.pubdate ?? 0) * 1000,
                  play: v.stat?.view ?? 0,
                  danmaku: v.stat?.danmaku ?? 0,
                  url: `https://www.bilibili.com/video/${v.bvid}`,
                }
              })
            )
            data = { items }
          }

          res.end(JSON.stringify(data))
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: true, message: String(e) }))
        }
      })
    },
  }
}

