import type { BiliProfile, BiliStats } from '../services/bilibili'
import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './BiliCard.module.css'

type BiliProfileCardProps = {
  label: string
  isFriend?: boolean
  profile: BiliProfile
  stats: BiliStats
}

export default function BiliProfileCard({ label, isFriend, profile, stats }: BiliProfileCardProps) {
  return (
    <Card variant="elevated" className={styles.profileCard}>
      <div className={styles.profileHead}>
        <div className={styles.profileTitle}>
          <SvgIcon file="bilibili.svg" size={18} />
          <span>{label}</span>
          {isFriend ? <span className={styles.badge}>朋友</span> : null}
        </div>
        <Button variant="text" href={`https://space.bilibili.com/${profile.mid}`} target="_blank" rel="noreferrer">
          去空间
        </Button>
      </div>

      <div className={styles.profileContent}>
        <img
          className={styles.avatar}
          src={profile.face || `${import.meta.env.BASE_URL}svgs/bilibili.svg`}
          alt={`${profile.name} 的头像`}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{profile.name}</span>
            <span className={styles.mid}>mid: {profile.mid}</span>
          </div>
          {profile.sign ? <p className={styles.sign}>{profile.sign}</p> : null}
          <div className={styles.stats}>
            <span className={styles.pill}>粉丝 {stats.follower}</span>
            <span className={styles.pill}>关注 {stats.following}</span>
            <span className={styles.pill}>获赞 {stats.likes}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
