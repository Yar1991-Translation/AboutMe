import type { RobloxProfile } from '../types/games'
import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './GameProfile.module.css'

type RobloxProfileCardProps = {
  profile: RobloxProfile
}

export default function RobloxProfileCard({ profile }: RobloxProfileCardProps) {
  return (
    <Card variant="elevated" className={styles.card}>
      <div className={styles.content}>
        <img
          className={styles.avatar}
          src={profile.avatarUrl || `${import.meta.env.BASE_URL}svgs/roblox.svg`}
          alt={`${profile.displayName} 的头像`}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <span className={styles.name}>{profile.displayName}</span>
            <span className={styles.handle}>@{profile.name}</span>
          </div>

          <div className={styles.pills}>
            <span className={styles.pill}>
              <SvgIcon file="roblox.svg" size={16} /> ID: {profile.userId}
            </span>
            <span className={styles.pill}>关注者 {profile.followersCount}</span>
            <span className={styles.pill}>关注中 {profile.followingCount}</span>
            <span className={styles.pill}>好友 {profile.friendsCount}</span>
          </div>

          <div className={styles.actions}>
            <Button variant="tonal" href={profile.profileUrl} target="_blank" rel="noreferrer">
              去主页看看
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
