import { Suspense, lazy, useState } from 'react'
import './App.css'
import Icon from './components/Icon'
import NavigationRail from './components/NavigationRail'
import type { RailPageId } from './components/NavigationRail'
import BottomNavigation from './components/BottomNavigation'
import { useThemeMode } from './hooks/useThemeMode'
import { useSeasonPreference } from './hooks/useSeasonPreference'

const HomePage = lazy(() => import('./pages/HomePage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const ReposPage = lazy(() => import('./pages/ReposPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

const pageFallback = (
  <div className="page">
    <div className="empty-state">
      <Icon name="hourglass_empty" className="empty-state__icon" />
      <p className="empty-state__text">正在加载页面…</p>
    </div>
  </div>
)

function App() {
  const [activePage, setActivePage] = useState<RailPageId>('home')
  const { themeMode, setThemeMode } = useThemeMode()
  const { seasonPreference, setSeasonPreference } = useSeasonPreference()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChangePage = (id: RailPageId) => {
    setActivePage(id)
    scrollToTop()
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={handleChangePage} />
      case 'games':
        return <GamesPage />
      case 'repos':
        return <ReposPage />
      case 'contact':
        return <ContactPage seasonPreference={seasonPreference} onSeasonChange={setSeasonPreference} />
      default:
        return <HomePage onNavigate={handleChangePage} />
    }
  }

  return (
    <mdui-layout>
      <div className="app-shell">
        <NavigationRail active={activePage} onChange={handleChangePage} />

        <div className="app-main">
          <mdui-top-app-bar variant="small">
            <mdui-top-app-bar-title>Yatmt</mdui-top-app-bar-title>
            <div className="appbar-actions">
              <mdui-button-icon
                icon="palette"
                variant="tonal"
                onClick={() => handleChangePage('contact')}
                aria-label="季节配色设置"
              ></mdui-button-icon>
              <mdui-button-icon
                icon={themeMode === 'dark' ? 'light_mode' : 'dark_mode'}
                variant="tonal"
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                aria-label="切换主题"
              ></mdui-button-icon>
            </div>
          </mdui-top-app-bar>

          <div className="layout-main">
            <div className="page">
              <Suspense fallback={pageFallback}>{renderPage()}</Suspense>
              <footer className="footer">
                <div className="footer-content">
                  <p className="footer-text">
                    现搓网站一份：React & mdui 驱动，<Icon name="favorite" className="footer-heart" /> 友情加成
                  </p>
                  <p className="footer-copyright">© {new Date().getFullYear()} Yatmt. All rights reserved.</p>
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

        <BottomNavigation active={activePage} onChange={handleChangePage} />
      </div>
    </mdui-layout>
  )
}

export default App
