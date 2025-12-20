import type { BiliVideoItem } from '../services/bilibili'

type BiliVideoGridProps = {
  title: string
  items: BiliVideoItem[]
}

const fmtDate = (ms: number) => {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function BiliVideoGrid({ title, items }: BiliVideoGridProps) {
  return (
    <mdui-card className="bili-videos" variant="outlined">
      <div className="bili-videos__head">
        <h3 className="bili-videos__title">{title}</h3>
      </div>
      {items.length ? (
        <div className="bili-videos__grid">
          {items.map((v) => (
            <a key={v.bvid} className="bili-video" href={v.url} target="_blank" rel="noreferrer">
              <div className="bili-video__cover">
                <img src={v.cover} alt={v.title} loading="lazy" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              </div>
              <div className="bili-video__body">
                <div className="bili-video__title">{v.title}</div>
                <div className="bili-video__meta">
                  <span>{fmtDate(v.created)}</span>
                  <span>播放 {v.play}</span>
                  <span>弹幕 {v.danmaku}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bili-videos__empty">暂无视频</div>
      )}
    </mdui-card>
  )
}

export default BiliVideoGrid


