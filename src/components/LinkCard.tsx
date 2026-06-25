import TagChip from './TagChip'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import { renderSocialIcon } from '@/utils/socialIcon'
import type { LinkItem } from '../content'
import styles from './LinkCard.module.css'

type LinkCardProps = {
  title: string
  description: string
  role: string
  contribution: string[]
  cover: string
  tags: string[]
  links: LinkItem[]
}

export default function LinkCard({
  title,
  description,
  role,
  contribution,
  cover,
  tags,
  links,
}: LinkCardProps) {
  return (
    <Card variant="filled" interactive className={styles.card}>
      <div className={styles.media}>
        <img src={cover} alt={title} loading="lazy" />
      </div>

      <div className={styles.body}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{description}</p>
          <p className={styles.meta}>担任 · {role}（在线营业）</p>
        </div>

        {contribution?.length ? (
          <ul className={styles.list}>
            {contribution.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {tags?.length ? (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        ) : null}
      </div>

      {links?.length ? (
        <div className={styles.actions}>
          {links.map((link) => (
            <Button key={link.label} variant="tonal" href={link.href} target="_blank" rel="noreferrer">
              {renderSocialIcon(link.href, link.icon)}
              {link.label}
            </Button>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
