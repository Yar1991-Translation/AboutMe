import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import Icon from './Icon'
import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import styles from './Hero.module.css'

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

const renderSocialIcon = (href: string, fallback?: string) => {
  const h = href.toLowerCase()
  if (h.includes('bilibili.com')) return <SvgIcon file="bilibili.svg" />
  if (h.includes('github.com')) return <SvgIcon file="github.svg" />
  if (h.includes('youtube.com') || h.includes('youtu.be')) return <SvgIcon file="youtube.svg" />
  return fallback ? <Icon name={fallback} /> : null
}

export default function Hero({
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
  return (
    <Card variant="elevated" className={styles.card}>
      <div className={styles.hero}>
        <div className={styles.text}>
          <p className={styles.location}>
            <Icon name="location_on" style={{ fontSize: '1.1em' }} />
            {location}
          </p>

          <motion.h1
            className={styles.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          >
            {name}
          </motion.h1>

          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <p className={styles.intro}>{intro}</p>

          {tags && tags.length > 0 && (
            <motion.div
              className={styles.tags}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  className={styles.tag}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button
              variant="filled"
              href={primaryAction.href}
              target="_blank"
              rel="noreferrer"
              className={styles.primaryBtn}
            >
              {renderSocialIcon(primaryAction.href, primaryAction.icon)}
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button variant="outlined" href={secondaryAction.href} target="_blank" rel="noreferrer">
                {renderSocialIcon(secondaryAction.href, secondaryAction.icon)}
                {secondaryAction.label}
              </Button>
            )}
          </motion.div>
        </div>

        {side ? <div className={styles.side}>{side}</div> : null}
      </div>
    </Card>
  )
}
