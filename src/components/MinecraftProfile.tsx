import { useMemo, useState } from 'react'
import type { MinecraftProfile as MCProfile } from '../types/games'

type MinecraftProfileProps = {
  profile: MCProfile
}

function MinecraftProfile({ profile }: MinecraftProfileProps) {
  const fallbacks = useMemo(() => {
    const username = encodeURIComponent(profile.username)
    const uuid = encodeURIComponent(profile.uuid)

    // 1) crafatar 3D 头（最酷）
    // 2) crafatar 普通头像（更稳）
    // 3) 备用头像源（避免被某些拦截规则误伤）
    // 4) 本地占位
    return [
      profile.head3d,
      profile.avatar,
      `https://mc-heads.net/avatar/${uuid}/128`,
      `https://minotar.net/armor/bust/${username}/128`,
      `${import.meta.env.BASE_URL}svgs/minecraft.svg`,
    ].filter(Boolean)
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
    <mdui-card className="mc-profile" variant="elevated">
      <div className="mc-profile__content">
        <div className="mc-profile__render">
          <img 
            src={imgSrc}
            alt={`${profile.username} 的头像`}
            className="mc-profile__head"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImgError}
          />
        </div>
        <div className="mc-profile__info">
          <h3 className="mc-profile__username">{profile.username}</h3>
          <p className="mc-profile__uuid">
            <span className="mc-profile__label">UUID</span>
            <code>{profile.uuid}</code>
          </p>
        </div>
      </div>
      <div className="mc-profile__actions">
        <mdui-button
          variant="tonal"
          href={`https://namemc.com/profile/${profile.username}`}
          target="_blank"
          rel="noreferrer"
        >
          NameMC
        </mdui-button>
        <mdui-button
          variant="outlined"
          href={profile.skin}
          target="_blank"
          rel="noreferrer"
        >
          皮肤打包带走
        </mdui-button>
      </div>
    </mdui-card>
  )
}

export default MinecraftProfile

