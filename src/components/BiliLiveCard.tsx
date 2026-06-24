import { useState } from 'react'
import type { BiliLive } from '../services/bilibili'
import SvgIcon from './SvgIcon'

type BiliLiveCardProps = {
  label: string
  isFriend?: boolean
  live: BiliLive
}

function BiliLiveCard({ label, isFriend, live }: BiliLiveCardProps) {
  const [showEmbed, setShowEmbed] = useState(false)

  // B站直播嵌入 URL
  const embedUrl = live.roomid
    ? `https://live.bilibili.com/blackboard/live-activity-player.html?cid=${live.roomid}&quality=0&mute=1&autoplay=0`
    : null

  return (
    <mdui-card className="bili-live" variant="outlined">
      <div className="bili-live__head">
        <div className="bili-live__title">
          <SvgIcon file="bilibili.svg" size={18} />
          <span className="bili-live__label">{label} · 直播</span>
          {isFriend ? <mdui-chip className="bili-badge">朋友</mdui-chip> : null}
        </div>
        {live.url ? (
          <mdui-button variant={live.liveStatus ? 'filled' : 'tonal'} href={live.url} target="_blank" rel="noreferrer">
            {live.liveStatus ? '正在直播' : '去直播间'}
          </mdui-button>
        ) : (
          <span className="bili-live__disabled">未开通</span>
        )}
      </div>

      <div className="bili-live__body">
        <span className={`bili-dot ${live.liveStatus ? 'is-live' : ''}`}></span>
        <span className="bili-live__text">{live.liveStatus ? (live.title || '直播中') : '未开播'}</span>
      </div>

      {/* 正在直播时显示嵌入切换按钮和播放器 */}
      {live.liveStatus && embedUrl && (
        <div className="bili-live__embed-section">
          <mdui-button
            className="bili-live__embed-toggle"
            variant="text"
            onClick={() => setShowEmbed(!showEmbed)}
          >
            {showEmbed ? '收起直播' : '展开直播'}
          </mdui-button>

          {showEmbed && (
            <div className="bili-live__embed">
              <iframe
                src={embedUrl}
                className="bili-live__iframe"
                allowFullScreen
                frameBorder="0"
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      )}
    </mdui-card>
  )
}

export default BiliLiveCard


