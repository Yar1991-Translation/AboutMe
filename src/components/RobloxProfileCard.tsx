import type { RobloxProfile } from '../types/games'
import SvgIcon from './SvgIcon'

type RobloxProfileCardProps = {
  profile: RobloxProfile
}

function RobloxProfileCard({ profile }: RobloxProfileCardProps) {
  return (
    <mdui-card className="rb-profile" variant="elevated">
      <div className="rb-profile__content">
        <img
          className="rb-profile__avatar"
          src={profile.avatarUrl || `${import.meta.env.BASE_URL}svgs/roblox.svg`}
          alt={`${profile.displayName} 的头像`}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />

        <div className="rb-profile__info">
          <div className="rb-profile__title">
            <span className="rb-profile__name">{profile.displayName}</span>
            <span className="rb-profile__handle">@{profile.name}</span>
          </div>

          <div className="rb-profile__meta">
            <span className="rb-profile__pill">
              <SvgIcon file="roblox.svg" size={16} /> ID: {profile.userId}
            </span>
            <span className="rb-profile__pill">关注者 {profile.followersCount}</span>
            <span className="rb-profile__pill">关注中 {profile.followingCount}</span>
            <span className="rb-profile__pill">好友 {profile.friendsCount}</span>
          </div>

          <div className="rb-profile__actions">
            <mdui-button variant="tonal" href={profile.profileUrl} target="_blank" rel="noreferrer">
              去主页看看
            </mdui-button>
          </div>
        </div>
      </div>
    </mdui-card>
  )
}

export default RobloxProfileCard


