import { NavLink } from 'react-router'
import { motion } from 'motion/react'
import Icon from '@/components/Icon'
import { railItems } from '@/components/NavigationRail'
import styles from './NavRail.module.css'

/**
 * 桌面侧边导航栏（替代旧 NavigationRail），自带活动项滑动指示器。
 */
export default function NavRail() {
  return (
    <aside className={styles.rail} aria-label="主导航">
      <div className={styles.brand} aria-hidden>
        Y
      </div>
      <nav className={styles.items}>
        {railItems.map((it) => (
          <NavLink
            key={it.id}
            to={it.path}
            end={it.path === '/'}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className={styles.iconWrap}>
                  {isActive && (
                    <motion.span
                      layoutId="rail-indicator"
                      className={styles.indicator}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon name={it.icon} className={styles.icon} />
                </span>
                <span className={styles.label}>{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
