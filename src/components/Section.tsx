import type { PropsWithChildren, ReactNode } from 'react'
import { motion } from 'motion/react'
import { useInView } from '@/hooks/useInView'
import styles from './Section.module.css'

type SectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: ReactNode
  /** 字幕条编号（如 "01"） */
  index?: string
}>

export default function Section({ title, subtitle, actions, index, children }: SectionProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  return (
    <motion.section
      ref={ref}
      className={styles.section}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
    >
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          {index && <span className={styles.index}>{index}</span>}
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {children}
    </motion.section>
  )
}
