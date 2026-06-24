import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'
import NavigationRail, { pathToRailId, railIdToPath, type RailPageId } from '@/components/NavigationRail'
import BottomNavigation from '@/components/BottomNavigation'
import { useTheme } from '@/theme/ThemeProvider'

const pageFallback = (
  <div className="empty-state">
    <Icon name="hourglass_empty" className="empty-state__icon" />
    <p className="empty-state__text">正在加载页面…</p>
  </div>
)

export default function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()
  const { themeMode, toggleThemeMode } = useTheme()

  const active: RailPageId = pathToRailId(location.pathname)

  const go = (id: RailPageId) => navigate(railIdToPath(id))

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.2, 0, 0, 1] as const }

  return (
    <mdui-layout>
      <div className="app-shell">
        <NavigationRail active={active} onChange={go} />

        <div className="app-main">
          <mdui-top-app-bar variant="small">
            <mdui-top-app-bar-title>Yatmt</mdui-top-app-bar-title>
            <div className="appbar-actions">
              <mdui-button-icon
                icon="palette"
                variant="tonal"
                onClick={() => navigate('/contact')}
                aria-label="季节配色设置"
              ></mdui-button-icon>
              <mdui-button-icon
                icon={themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
                variant="tonal"
                onClick={toggleThemeMode}
                aria-label="切换主题"
              ></mdui-button-icon>
            </div>
          </mdui-top-app-bar>

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
                <mdui-button-icon
                  className="back-to-top"
                  onClick={scrollToTop}
                  aria-label="回到顶部"
                  icon="keyboard_arrow_up"
                ></mdui-button-icon>
              </footer>
            </div>
          </div>
        </div>

        <BottomNavigation active={active} onChange={go} />
      </div>
    </mdui-layout>
  )
}
