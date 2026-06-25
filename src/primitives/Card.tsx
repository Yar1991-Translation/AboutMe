import type { ReactNode, CSSProperties } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'elevated' | 'filled' | 'outlined'

type CardProps = {
  variant?: CardVariant
  /** 是否启用 hover 抬升交互 */
  interactive?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * MD3 卡片容器原语（替代 mdui-card）。
 */
export default function Card({
  variant = 'elevated',
  interactive = false,
  className = '',
  style,
  children,
}: CardProps) {
  const cls = [styles.card, styles[variant], interactive ? styles.interactive : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}
