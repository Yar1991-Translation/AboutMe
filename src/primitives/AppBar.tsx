import type { ReactNode, MouseEventHandler } from 'react'
import Icon from '@/components/Icon'
import styles from './AppBar.module.css'

type AppBarAction = {
  icon: string
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

type AppBarProps = {
  title?: string
  /** 左侧 brand/logo 占位 */
  leading?: ReactNode
  actions?: AppBarAction[]
}

/**
 * 自建顶部应用栏（替代 mdui-top-app-bar variant="small"）。
 */
export default function AppBar({ title, leading, actions }: AppBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        {leading && <div className={styles.leading}>{leading}</div>}
        {title && <span className={styles.title}>{title}</span>}
        <div className={styles.grow} />
        {actions && (
          <div className={styles.actions}>
            {actions.map((a) => (
              <button
                key={a.icon}
                type="button"
                className={styles.actionBtn}
                aria-label={a.label}
                onClick={a.onClick}
              >
                <Icon name={a.icon} />
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
