import Section from '../components/Section'
import Icon from '../components/Icon'
import BiliProfileCard from '../components/BiliProfileCard'
import BiliVideoGrid from '../components/BiliVideoGrid'
import { bilibiliConfig } from '../config/bilibili'
import type { BiliProfile, BiliStats, BiliVideoItem } from '../services/bilibili'

type BiliSectionProps = {
  loading: boolean
  error: string | null
  hasRequested: boolean
  profiles: Record<number, BiliProfile | null>
  stats: Record<number, BiliStats | null>
  latest: Record<number, { mid: number; items: BiliVideoItem[] } | null>
  pinned: Record<number, { items: BiliVideoItem[] } | null>
}

function BiliSection({ loading, error, hasRequested, profiles, stats, latest, pinned }: BiliSectionProps) {
  return (
    <Section title="B站动态" subtitle="我和朋友们的 B站更新（由 Vercel 代理拉取）。">
      {!hasRequested ? (
        <div className="empty-state">
          <Icon name="hourglass_empty" className="empty-state__icon" />
          <p className="empty-state__text">B站数据准备中…</p>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <Icon name="schedule" className="empty-state__icon" />
          <p className="empty-state__text">正在拉取 B站数据…</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <Icon name="warning" className="empty-state__icon" />
          <p className="empty-state__text">B站数据加载失败：{error}</p>
        </div>
      ) : (
        <div className="bili-section">
          {bilibiliConfig.channels.map((c) => {
            const p = profiles[c.mid]
            const s = stats[c.mid]
            const latestItems = latest[c.mid]?.items ?? []
            const pinnedItems = pinned[c.mid]?.items ?? []

            return (
              <div key={c.mid} className="bili-channel">
                {p && s ? <BiliProfileCard label={c.label} isFriend={c.isFriend} profile={p} stats={s} /> : null}
                {pinnedItems.length ? <BiliVideoGrid title="置顶/精选" items={pinnedItems} /> : null}
                <BiliVideoGrid title="最新视频" items={latestItems} />
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

export default BiliSection
