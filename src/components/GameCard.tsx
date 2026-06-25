import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './GameCard.module.css'

type GameCardProps = {
  title: string
  cover: string
  subtitle?: string
  link?: string
  linkLabel?: string
  platform: 'steam' | 'roblox'
}

export default function GameCard({
  title,
  cover,
  subtitle,
  link,
  linkLabel = '去康康',
  platform,
}: GameCardProps) {
  const platformSvg = platform === 'steam' ? 'steam.svg' : 'roblox.svg'

  return (
    <Card variant="filled" interactive className={styles.card}>
      <div className={styles.media}>
        <img src={cover} alt={title} loading="lazy" />
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.platformIcon}>
            <SvgIcon file={platformSvg} size={18} />
          </span>
          <h4 className={styles.title}>{title}</h4>
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {link && (
        <div className={styles.actions}>
          <Button variant="text" href={link} target="_blank" rel="noreferrer" icon="open_in_new">
            {linkLabel}
          </Button>
        </div>
      )}
    </Card>
  )
}
