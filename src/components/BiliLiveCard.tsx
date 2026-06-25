import { useState } from 'react'
import type { BiliLive } from '../services/bilibili'
import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './BiliCard.module.css'

type BiliLiveCardProps = {
  label: string
  isFriend?: boolean
  live: BiliLive
}

export default function BiliLiveCard({ label, isFriend, live }: BiliLiveCardProps) {
  const [showEmbed, setShowEmbed] = useState(false)

  const embedUrl = live.roomid
    ? `https://live.bilibili.com/blackboard/live-activity-player.html?cid=${live.roomid}&quality=0&mute=1&autoplay=0`
    : null

  return (
    <Card variant="outlined" className={styles.liveCard}>
      <div className={styles.liveHead}>
        <div className={styles.liveTitle}>
          <SvgIcon file="bilibili.svg" size={18} />
          <span>{label} · 直播</span>
          {isFriend ? <span className={styles.badge}>朋友</span> : null}
        </div>
        {live.url ? (
          <Button
            variant={live.liveStatus ? 'filled' : 'tonal'}
            href={live.url}
            target="_blank"
            rel="noreferrer"
          >
            {live.liveStatus ? '正在直播' : '去直播间'}
          </Button>
        ) : (
          <span className={styles.liveDisabled}>未开通</span>
        )}
      </div>

      <div className={styles.liveBody}>
        <span className={`${styles.liveDot} ${live.liveStatus ? styles.liveDotActive : ''}`} />
        <span>{live.liveStatus ? (live.title || '直播中') : '未开播'}</span>
      </div>

      {live.liveStatus && embedUrl && (
        <div className={styles.embedSection}>
          <Button variant="text" onClick={() => setShowEmbed(!showEmbed)}>
            {showEmbed ? '收起直播' : '展开直播'}
          </Button>

          {showEmbed && (
            <div className={styles.embed}>
              <iframe
                src={embedUrl}
                className={styles.iframe}
                allowFullScreen
                frameBorder={0}
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
