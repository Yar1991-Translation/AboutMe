import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import Icon from './Icon'
import Button from '@/primitives/Button'
import { renderSocialIcon } from '@/utils/socialIcon'
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
    <div className={styles.hero}>
      <div className={styles.text}>
        <motion.p
          className={styles.location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Icon name="location_on" style={{ fontSize: '1.1em' }} />
          {location}
        </motion.p>

        {/* 名字 —— 打字机逐字显现 */}
        <motion.h1
          className={styles.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {name.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
          <motion.span
            className={styles.cursor}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.2 + name.length * 0.07, duration: 0.8, repeat: Infinity }}
          >
            |
          </motion.span>
        </motion.h1>

        {/* 字幕条标题 */}
        <motion.div
          className={styles.subtitleBar}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <span className={styles.subtitleTimecode}>00:01</span>
          <span className={styles.subtitleText}>{title}</span>
        </motion.div>

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <p className={styles.intro}>{intro}</p>

        {tags && tags.length > 0 && (
          <motion.div
            className={styles.tags}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.7 } } }}
          >
            {tags.map((tag) => (
              <motion.span
                key={tag}
                className={styles.tag}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 6 },
                  visible: { opacity: 1, scale: 1, y: 0 },
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
          transition={{ delay: 0.9, duration: 0.4 }}
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
  )
}
