import { useMemo, useState } from 'react'
import type { MinecraftProfile as MCProfile } from '../types/games'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './GameProfile.module.css'

type MinecraftProfileProps = {
  profile: MCProfile
}

export default function MinecraftProfile({ profile }: MinecraftProfileProps) {
  const fallbacks = useMemo(() => {
    const username = encodeURIComponent(profile.username)
    const uuid = encodeURIComponent(profile.uuid)
    return [
      profile.head3d,
      profile.avatar,
      `https://mc-heads.net/avatar/${uuid}/128`,
      `https://minotar.net/armor/bust/${username}/128`,
      `${import.meta.env.BASE_URL}svgs/minecraft.svg`,
    ].filter(Boolean) as string[]
  }, [profile.avatar, profile.head3d, profile.username, profile.uuid])

  const [imgSrc, setImgSrc] = useState<string>(fallbacks[0] ?? '')
  const [fallbackIndex, setFallbackIndex] = useState(0)

  const handleImgError = () => {
    const nextIndex = fallbackIndex + 1
    const next = fallbacks[nextIndex]
    if (next) {
      setFallbackIndex(nextIndex)
      setImgSrc(next)
    }
  }

  return (
    <Card variant="elevated" className={styles.card}>
      <div className={styles.content}>
        <div className={styles.mcRender}>
          <img
            src={imgSrc}
            alt={`${profile.username} 的头像`}
            className={styles.mcHead}
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImgError}
          />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{profile.username}</h3>
          <p className={styles.uuid}>
            <span className={styles.uuidLabel}>UUID</span>
            <code>{profile.uuid}</code>
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="tonal" href={`https://namemc.com/profile/${profile.username}`} target="_blank" rel="noreferrer">
          NameMC
        </Button>
        <Button variant="outlined" href={profile.skin} target="_blank" rel="noreferrer">
          皮肤打包带走
        </Button>
      </div>
    </Card>
  )
}
