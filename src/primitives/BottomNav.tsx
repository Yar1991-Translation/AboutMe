import { NavLink } from 'react-router'
import { motion } from 'motion/react'
import Icon from '@/components/Icon'
import { railItems } from '@/components/NavigationRail'
import styles from './BottomNav.module.css'

/**
 * 移动端底部导航栏（替代旧 BottomNavigation），隐藏于 ≥600px。
 */
export default function BottomNav() {
  return (
    <nav className={styles.bar} aria-label="底部导航">
      {railItems.map((it) => (
        <NavLink
          key={it.id}
          to={it.path}
          end={it.path === '/'}
          className={styles.item}
        >
          {({ isActive }) => (
            <>
              <span className={styles.iconWrap}>
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-indicator"
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
  )
}
