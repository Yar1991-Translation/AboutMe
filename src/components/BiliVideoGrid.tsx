import type { BiliVideoItem } from '../services/bilibili'
import Card from '@/primitives/Card'
import { formatShortDate } from '@/utils/date'
import styles from './BiliCard.module.css'

type BiliVideoGridProps = {
  title: string
  items: BiliVideoItem[]
}

export default function BiliVideoGrid({ title, items }: BiliVideoGridProps) {
  return (
    <Card variant="outlined" className={styles.videoCard}>
      <div className={styles.videoHead}>
        <h3 className={styles.videoTitle}>{title}</h3>
      </div>
      {items.length ? (
        <div className={styles.videoGrid}>
          {items.map((v) => (
            <a key={v.bvid} className={styles.videoItem} href={v.url} target="_blank" rel="noreferrer">
              <div className={styles.videoCover}>
                <img src={v.cover} alt={v.title} loading="lazy" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              </div>
              <div className={styles.videoBody}>
                <div className={styles.videoItemTitle}>{v.title}</div>
                <div className={styles.videoMeta}>
                  <span>{formatShortDate(v.created)}</span>
                  <span>播放 {v.play}</span>
                  <span>弹幕 {v.danmaku}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className={styles.videoEmpty}>暂无视频</div>
      )}
    </Card>
  )
}
