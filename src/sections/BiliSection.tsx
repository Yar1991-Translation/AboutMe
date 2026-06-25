import Section from '../components/Section'
import EmptyState from '@/primitives/EmptyState'
import BiliProfileCard from '../components/BiliProfileCard'
import BiliVideoGrid from '../components/BiliVideoGrid'
import { bilibiliConfig } from '../config/bilibili'
import type { BiliProfile, BiliStats, BiliVideoItem } from '../services/bilibili'
import styles from './BiliSection.module.css'

type BiliSectionProps = {
  loading: boolean
  error: string | null
  hasRequested: boolean
  profiles: Record<number, BiliProfile | null>
  stats: Record<number, BiliStats | null>
  latest: Record<number, { mid: number; items: BiliVideoItem[] } | null>
  pinned: Record<number, { items: BiliVideoItem[] } | null>
}

export default function BiliSection({ loading, error, hasRequested, profiles, stats, latest, pinned }: BiliSectionProps) {
  return (
    <Section title="B站动态" subtitle="我和朋友们的 B站更新（由 Vercel 代理拉取）。" index="03">
      {!hasRequested ? (
        <EmptyState icon="hourglass_empty" text="B站数据准备中…" />
      ) : loading ? (
        <EmptyState icon="schedule" text="正在拉取 B站数据…" />
      ) : error ? (
        <EmptyState icon="warning" text={`B站数据加载失败：${error}`} />
      ) : (
        <div className={styles.channels}>
          {bilibiliConfig.channels.map((c) => {
            const p = profiles[c.mid]
            const s = stats[c.mid]
            const latestItems = latest[c.mid]?.items ?? []
            const pinnedItems = pinned[c.mid]?.items ?? []

            return (
              <div key={c.mid} className={styles.channel}>
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
