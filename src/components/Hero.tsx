import Icon from './Icon'
import SvgIcon from './SvgIcon'
import type { ReactNode } from 'react'

type HeroProps = {
  name: string
  title: string
  subtitle?: string
  intro: string
  location: string
  tags?: string[]
  primaryAction: { label: string; href: string; icon?: string }
  secondaryAction?: { label: string; href: string; icon?: string }
  side?: ReactNode
}

function Hero({
  name,
  title,
  subtitle,
  intro,
  location,
  tags,
  primaryAction,
  secondaryAction,
  side,
}: HeroProps) {
  const renderSocialIcon = (href: string, fallback?: string) => {
    const h = href.toLowerCase()
    if (h.includes('bilibili.com')) return <SvgIcon file="bilibili.svg" slot="icon" />
    if (h.includes('github.com')) return <SvgIcon file="github.svg" slot="icon" />
    if (h.includes('youtube.com') || h.includes('youtu.be')) return <SvgIcon file="youtube.svg" slot="icon" />
    return fallback ? <Icon name={fallback} slot="icon" /> : null
  }

  return (
    <mdui-card className="hero-card" variant="elevated">
      <div className="hero">
        <div className="hero-text">
          <p className="location">
            <Icon name="location_on" style={{ fontSize: '1.1em' }} />
            {location}
          </p>
          <h1 className="hero-name">{name}</h1>
          <h3 className="hero-title">{title}</h3>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
          <p className="hero-intro">{intro}</p>
          
          {tags && tags.length > 0 && (
            <div className="hero-tags">
              {tags.map((tag) => (
                <span key={tag} className="hero-tag">{tag}</span>
              ))}
            </div>
          )}
          
          <div className="hero-actions">
            <mdui-button
              variant="filled"
              href={primaryAction.href}
              target="_blank"
              rel="noreferrer"
              className="hero-btn-primary"
            >
              {renderSocialIcon(primaryAction.href, primaryAction.icon)}
              {primaryAction.label}
            </mdui-button>
            {secondaryAction && (
              <mdui-button
                variant="outlined"
                href={secondaryAction.href}
                target="_blank"
                rel="noreferrer"
              >
                {renderSocialIcon(secondaryAction.href, secondaryAction.icon)}
                {secondaryAction.label}
              </mdui-button>
            )}
          </div>
        </div>
        {side ? <div className="hero-side">{side}</div> : null}
      </div>
    </mdui-card>
  )
}

export default Hero

