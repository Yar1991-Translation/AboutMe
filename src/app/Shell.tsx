import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'
import NavRail from '@/primitives/NavRail'
import BottomNav from '@/primitives/BottomNav'
import AppBar from '@/primitives/AppBar'
import { useTheme } from '@/theme/ThemeProvider'

const pageFallback = (
  <div style={{ padding: '48px 0', textAlign: 'center' }}>
    <Icon name="hourglass_empty" style={{ fontSize: 48, opacity: 0.4 }} />
    <p>正在加载页面…</p>
  </div>
)

export default function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()
  const { themeMode, toggleThemeMode } = useTheme()

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.2, 0, 0, 1] as const }

  return (
    <div className="app-shell">
      <NavRail />

      <div className="app-main">
        <AppBar
          title="Yatmt"
          actions={[
            { icon: 'palette', label: '季节配色设置', onClick: () => navigate('/contact') },
            { icon: themeMode === 'dark' ? 'light_mode' : 'dark_mode', label: '切换主题', onClick: toggleThemeMode },
          ]}
        />

        <div className="layout-main">
          <div className="page">
            <Suspense fallback={<div className="page">{pageFallback}</div>}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={transition}
                >
                  {outlet ?? <Outlet />}
                </motion.div>
              </AnimatePresence>
            </Suspense>

            <footer className="footer">
              <div className="footer-content">
                <p className="footer-text">
                  现搓网站一份：React & Material Web 驱动，
                  <Icon name="favorite" className="footer-heart" /> 友情加成
                </p>
                <p className="footer-copyright">
                  © {new Date().getFullYear()} Yatmt. All rights reserved.
                </p>
              </div>
              <button
                type="button"
                className="back-to-top"
                onClick={scrollToTop}
                aria-label="回到顶部"
              >
                <Icon name="keyboard_arrow_up" />
              </button>
            </footer>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
