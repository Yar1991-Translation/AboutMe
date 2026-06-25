import type { PropsWithChildren, ReactNode } from 'react'
import styles from './Section.module.css'

type SectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: ReactNode
}>

export default function Section({ title, subtitle, actions, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
