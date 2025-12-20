import { useEffect, useMemo, useState } from 'react'
import { setTheme } from 'mdui/functions/setTheme'
import { setColorScheme } from 'mdui/functions/setColorScheme'
import './App.css'
import Section from './components/Section'
import ContactBar from './components/ContactBar'
import Hero from './components/Hero'
import Icon from './components/Icon'
import GameCard from './components/GameCard'
import GameTabs from './components/GameTabs'
import SubsRepos from './components/SubsRepos'
import NavigationRail from './components/NavigationRail'
import type { RailPageId } from './components/NavigationRail'
import BottomNavigation from './components/BottomNavigation'
import RepoCard from './components/RepoCard'
import SeasonPicker from './components/SeasonPicker'
import { content } from './content'
import generatedSubs from './data/generated-subs-repos.json'
import generatedGames from './data/generated-games.json'
import type { GeneratedSubsRepos, GithubSubsRepo } from './types/subs'
import type { GeneratedGames } from './types/games'
import { githubReposConfig } from './config/githubRepos'
import {
  getEffectiveSeason,
  getSeasonSeedColor,
  getStoredSeasonPreference,
  storeSeasonPreference,
  type SeasonPreference,
} from './theme/season'

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const tabs = useMemo(() => content.tabs, [])
  const [activePage, setActivePage] = useState<RailPageId>('home')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(getInitialTheme)
  const [seasonPreference, setSeasonPreference] = useState<SeasonPreference>(getStoredSeasonPreference)

  useEffect(() => {
    setTheme(themeMode)
    localStorage.setItem('theme-mode', themeMode)
  }, [themeMode])

  useEffect(() => {
    storeSeasonPreference(seasonPreference)
    const effective = getEffectiveSeason(seasonPreference)
    if (effective) document.documentElement.dataset.season = effective
    else delete document.documentElement.dataset.season
    // 关键：让 mdui 的整套 MD3 palette 跟随季节切换
    setColorScheme(getSeasonSeedColor(effective))
  }, [seasonPreference])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChangePage = (id: RailPageId) => {
    setActivePage(id)
    scrollToTop()
  }

  const subsData = generatedSubs as GeneratedSubsRepos
  const gameData = generatedGames as GeneratedGames

  const featuredRepos = useMemo(() => {
    if (subsData.error) return []
    const all = subsData.repos ?? []
    const filtered = all
      .filter((r) => (githubReposConfig.hideArchived ? !r.archived : true))
      .filter((r) => (githubReposConfig.hideForks ? !r.fork : true))
      .filter((r) => {
        const flag = githubReposConfig.allowList?.[r.fullName]
        // 主页精选也遵循 allowList=false 的隐藏逻辑
        return flag !== false
      })

    const allowKeys = Object.entries(githubReposConfig.allowList ?? {})
      .filter(([, v]) => v === true)
      .map(([k]) => k)

    if (allowKeys.length) {
      const byKey = new Map(filtered.map((r) => [r.fullName, r]))
      return allowKeys
        .map((k) => byKey.get(k))
        .filter((r): r is GithubSubsRepo => Boolean(r))
        .slice(0, 6)
    }

    // 没有置顶时，默认给一个“看起来最像精选”的：星标优先，其次更新时间
    return [...filtered]
      .sort((a, b) => (b.stargazers - a.stargazers) || b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6)
  }, [])

  const steamTop = useMemo(() => {
    const list = gameData.steam ?? []
    return list.slice(0, 6)
  }, [])

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
              {activePage === 'home' ? (
                <>
                  <Hero {...content.hero} />
                  <Section title="快速入口" subtitle="先把常用的放这儿，省得你翻翻翻。">
                    <ContactBar contacts={content.contacts} variant="tonal" />
                  </Section>

                  <Section
                    title={Object.keys(githubReposConfig.allowList ?? {}).some((k) => githubReposConfig.allowList[k])
                      ? '精选仓库'
                      : '仓库速览'}
                    subtitle="置顶优先；没置顶就按「看起来最像精选」的来。"
                    actions={
                      <mdui-button variant="text" onClick={() => handleChangePage('repos')}>
                        去仓库页
                      </mdui-button>
                    }
                  >
                    {subsData.error ? (
                      <div className="empty-state">
                        <Icon name="folder" className="empty-state__icon" />
                        <p className="empty-state__text">仓库数据没拉到（网络/限流/配置都可能背锅）</p>
                      </div>
                    ) : featuredRepos.length ? (
                      <div className="repo-grid">
                        {featuredRepos.map((repo) => (
                          <RepoCard key={repo.id} repo={repo} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <Icon name="folder_off" className="empty-state__icon" />
                        <p className="empty-state__text">仓库列表目前是空的（或被过滤规则清空了）</p>
                      </div>
                    )}
                  </Section>

                  <Section
                    title="最近在玩"
                    subtitle="Steam Top N（按抓取顺序）。"
                    actions={
                      <mdui-button variant="text" onClick={() => handleChangePage('games')}>
                        去游戏页
                      </mdui-button>
                    }
                  >
                    {steamTop.length ? (
                      <div className="game-grid">
                        {steamTop.map((g) => (
                          <GameCard
                            key={g.appId}
                            title={g.title}
                            cover={g.cover}
                            subtitle={`${g.playtime} 小时`}
                            link={g.link}
                            linkLabel="Steam"
                            platform="steam"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <Icon name="sports_esports" className="empty-state__icon" />
                        <p className="empty-state__text">Steam 还没抓到（去 .env 填 STEAM_API_KEY / STEAM_ID）</p>
                      </div>
                    )}
                  </Section>
                </>
              ) : null}

              {activePage === 'games' ? (
                <Section title="游戏" subtitle="Steam / Roblox / Minecraft 一锅端。">
                  <GameTabs />
                </Section>
              ) : null}

              {activePage === 'repos' ? (
                <Section
                  title="仓库"
                  subtitle="全仓库展示（可在配置里开关）。"
                >
                  <SubsRepos />
                </Section>
              ) : null}

              {activePage === 'contact' ? (
                <>
                  <Section
                    title="联系我"
                    subtitle={
                      tabs.find((t) => t.id === 'contact')?.intro ??
                      '想聊就聊，想合作就合作，想一起玩也行（我不咬人，大概率）。'
                    }
                  >
                    <ContactBar contacts={content.contacts} />
                    <p style={{ margin: 0, color: 'rgb(var(--mdui-color-on-surface-variant))', lineHeight: 1.7 }}>
                      小提示：我可能会慢回，但不会装死；如果你发的是"救命"级别的事，那我就当场上线。
                    </p>
                  </Section>

                  <Section
                    title="季节配色"
                    subtitle="不申请定位权限：默认按时区推个半球，再按月份映射春夏秋冬；也可以手动锁定。"
                  >
                    <SeasonPicker value={seasonPreference} onChange={setSeasonPreference} />
                  </Section>
                </>
              ) : null}

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
