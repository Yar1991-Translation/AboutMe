import Icon from './Icon'
import SvgIcon from './SvgIcon'

type GameCardProps = {
  title: string
  cover: string
  subtitle?: string
  link?: string
  linkLabel?: string
  platform: 'steam' | 'roblox'
}

function GameCard({ title, cover, subtitle, link, linkLabel = '去康康', platform }: GameCardProps) {
  const platformSvg = platform === 'steam' ? 'steam.svg' : 'roblox.svg'
  
  return (
    <mdui-card className="game-card" variant="filled">
      <div className="game-card__media">
        <img src={cover} alt={title} loading="lazy" />
      </div>
      <div className="game-card__body">
        <div className="game-card__header">
          <span className="game-card__platform-icon">
            <SvgIcon file={platformSvg} size={18} />
          </span>
          <h4 className="game-card__title">{title}</h4>
        </div>
        {subtitle && <p className="game-card__subtitle">{subtitle}</p>}
      </div>
      {link && (
        <div className="game-card__actions">
          <mdui-button
            variant="text"
            href={link}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="open_in_new" slot="icon" />
            {linkLabel}
          </mdui-button>
        </div>
      )}
    </mdui-card>
  )
}

export default GameCard



