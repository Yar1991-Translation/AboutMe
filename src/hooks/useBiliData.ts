import { useEffect, useRef, useState } from 'react'
import { biliApi, type BiliLive, type BiliProfile, type BiliStats, type BiliVideoItem } from '../services/bilibili'
import { bilibiliConfig } from '../config/bilibili'

type BiliDataState = {
  loading: boolean
  error: string | null
  hasRequested: boolean
  profiles: Record<number, BiliProfile | null>
  stats: Record<number, BiliStats | null>
  lives: Record<number, BiliLive | null>
  latest: Record<number, { mid: number; items: BiliVideoItem[] } | null>
  pinned: Record<number, { items: BiliVideoItem[] } | null>
}

type UseBiliDataOptions = {
  enabled?: boolean
}

const emptyState: BiliDataState = {
  loading: false,
  error: null,
  hasRequested: false,
  profiles: {},
  stats: {},
  lives: {},
  latest: {},
  pinned: {},
}

export const useBiliData = ({ enabled = true }: UseBiliDataOptions = {}) => {
  const [state, setState] = useState<BiliDataState>(emptyState)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!enabled || hasLoadedRef.current) return
    let cancelled = false

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null, hasRequested: true }))
      try {
        const channels = bilibiliConfig.channels
        const ps = bilibiliConfig.latestCount

        const perChannel = await Promise.all(
          channels.map(async (c) => {
            const bvids = (c.pinnedBvIds ?? []).slice(0, 10)
            const pinnedPromise: Promise<{ items: BiliVideoItem[] } | null> = bvids.length
              ? biliApi.videos(bvids)
              : Promise.resolve(null)
            const [p, s, l, lat, pinned] = await Promise.allSettled([
              biliApi.profile(c.mid),
              biliApi.stats(c.mid),
              biliApi.live(c.mid),
              biliApi.latest(c.mid, ps),
              pinnedPromise,
            ])

            return {
              mid: c.mid,
              profile: p.status === 'fulfilled' ? p.value : null,
              stats: s.status === 'fulfilled' ? s.value : null,
              live: l.status === 'fulfilled' ? l.value : null,
              latest: lat.status === 'fulfilled' ? lat.value : null,
              pinned: pinned.status === 'fulfilled' ? pinned.value : null,
              errors: [p, s, l, lat, pinned]
                .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
                .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason))),
            }
          })
        )

        if (cancelled) return

        const profiles: Record<number, BiliProfile | null> = {}
        const stats: Record<number, BiliStats | null> = {}
        const lives: Record<number, BiliLive | null> = {}
        const latest: Record<number, { mid: number; items: BiliVideoItem[] } | null> = {}
        const pinned: Record<number, { items: BiliVideoItem[] } | null> = {}

        for (const r of perChannel) {
          profiles[r.mid] = r.profile
          stats[r.mid] = r.stats
          lives[r.mid] = r.live
          latest[r.mid] = r.latest
          pinned[r.mid] = r.pinned
        }

        const anySuccess = perChannel.some((r) => r.profile || r.stats || r.live || r.latest || r.pinned)
        const allErrors = perChannel.flatMap((r) => r.errors).filter(Boolean)

        setState({
          loading: false,
          error: !anySuccess && allErrors.length ? allErrors[0] : null,
          hasRequested: true,
          profiles,
          stats,
          lives,
          latest,
          pinned,
        })
        hasLoadedRef.current = true
      } catch (e) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: e instanceof Error ? e.message : 'B站数据加载失败',
            hasRequested: true,
          }))
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return state
}
