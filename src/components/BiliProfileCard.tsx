import type { BiliProfile, BiliStats } from '../services/bilibili'
import SvgIcon from './SvgIcon'

type BiliProfileCardProps = {
  label: string
  isFriend?: boolean
  profile: BiliProfile
  stats: BiliStats
}

function BiliProfileCard({ label, isFriend, profile, stats }: BiliProfileCardProps) {
  return (
    <mdui-card className="bili-profile" variant="elevated">
      <div className="bili-profile__head">
        <div className="bili-profile__title">
          <SvgIcon file="bilibili.svg" size={18} />
          <span className="bili-profile__label">{label}</span>
          {isFriend ? <mdui-chip className="bili-badge">朋友</mdui-chip> : null}
        </div>
        <mdui-button variant="text" href={`https://space.bilibili.com/${profile.mid}`} target="_blank" rel="noreferrer">
          去空间
        </mdui-button>
      </div>

      <div className="bili-profile__content">
        <img
          className="bili-profile__avatar"
          src={profile.face || `${import.meta.env.BASE_URL}svgs/bilibili.svg`}
          alt={`${profile.name} 的头像`}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
        <div className="bili-profile__info">
          <div className="bili-profile__nameRow">
            <span className="bili-profile__name">{profile.name}</span>
            <span className="bili-profile__mid">mid: {profile.mid}</span>
          </div>
          {profile.sign ? <p className="bili-profile__sign">{profile.sign}</p> : null}
          <div className="bili-profile__stats">
            <span className="bili-pill">粉丝 {stats.follower}</span>
            <span className="bili-pill">关注 {stats.following}</span>
            <span className="bili-pill">获赞 {stats.likes}</span>
          </div>
        </div>
      </div>
    </mdui-card>
  )
}

export default BiliProfileCard


