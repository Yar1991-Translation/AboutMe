import Icon from '@/components/Icon'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  icon?: string
  text: string
  className?: string
}

/**
 * 统一空状态/加载占位（替代散落各处的 .empty-state 模板）。
 */
export default function EmptyState({ icon = 'inbox', text, className = '' }: EmptyStateProps) {
  return (
    <div className={`${styles.empty} ${className}`}>
      <Icon name={icon} className={styles.icon} />
      <p className={styles.text}>{text}</p>
    </div>
  )
}
