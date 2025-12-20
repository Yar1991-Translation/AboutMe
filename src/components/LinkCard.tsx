import TagChip from './TagChip'
import Icon from './Icon'
import SvgIcon from './SvgIcon'
import type { LinkItem } from '../content'

type LinkCardProps = {
  title: string
  description: string
  role: string
  contribution: string[]
  cover: string
  tags: string[]
  links: LinkItem[]
}

function LinkCard({ title, description, role, contribution, cover, tags, links }: LinkCardProps) {
  const renderLinkIcon = (href: string, fallback?: string) => {
    const h = href.toLowerCase()
    if (h.includes('bilibili.com')) return <SvgIcon file="bilibili.svg" slot="icon" />
    if (h.includes('github.com')) return <SvgIcon file="github.svg" slot="icon" />
    if (h.includes('youtube.com') || h.includes('youtu.be')) return <SvgIcon file="youtube.svg" slot="icon" />
    return fallback ? <Icon name={fallback} slot="icon" /> : null
  }

  return (
    <mdui-card className="link-card" variant="filled">
      <div className="link-card__media">
        <img src={cover} alt={title} loading="lazy" />
      </div>

      <div className="link-card__body">
        <div className="link-card__header">
          <div>
            <h3 className="link-card__title">{title}</h3>
            <p className="link-card__desc">{description}</p>
            <p className="link-card__meta">担任 · {role}（在线营业）</p>
          </div>
        </div>

        {contribution?.length ? (
          <ul className="link-card__list">
            {contribution.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {tags?.length ? (
          <div className="link-card__tags">
            {tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        ) : null}
      </div>

      {links?.length ? (
        <div className="link-card__actions">
          {links.map((link) => (
            <mdui-button
              key={link.label}
              variant="tonal"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {renderLinkIcon(link.href, link.icon)}
              {link.label}
            </mdui-button>
          ))}
        </div>
      ) : null}
    </mdui-card>
  )
}

export default LinkCard

