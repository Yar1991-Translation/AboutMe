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
import BiliProfileCard from './components/BiliProfileCard'
import BiliLiveCard from './components/BiliLiveCard'
import BiliVideoGrid from './components/BiliVideoGrid'
import { content } from './content'
import generatedSubs from './data/generated-subs-repos.json'
import generatedGames from './data/generated-games.json'
import type { GeneratedSubsRepos, GithubSubsRepo } from './types/subs'
import type { GeneratedGames } from './types/games'
import { githubReposConfig } from './config/githubRepos'
import { bilibiliConfig } from './config/bilibili'
import { biliApi } from './services/bilibili'
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
  const [heroBiliTab, setHeroBiliTab] = useState<'me' | 'friends'>('me')

  const [biliLoading, setBiliLoading] = useState(false)
  const [biliError, setBiliError] = useState<string | null>(null)
  const [biliProfiles, setBiliProfiles] = useState<Record<number, Awaited<ReturnType<typeof biliApi.profile>> | null>>({})
  const [biliStats, setBiliStats] = useState<Record<number, Awaited<ReturnType<typeof biliApi.stats>> | null>>({})
  const [biliLives, setBiliLives] = useState<Record<number, Awaited<ReturnType<typeof biliApi.live>> | null>>({})
  const [biliLatest, setBiliLatest] = useState<Record<number, Awaited<ReturnType<typeof biliApi.latest>> | null>>({})
  const [biliPinnedVideos, setBiliPinnedVideos] = useState<Record<number, Awaited<ReturnType<typeof biliApi.videos>> | null>>({})

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

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setBiliLoading(true)
      setBiliError(null)
      try {
        const channels = bilibiliConfig.channels
        const ps = bilibiliConfig.latestCount

        const perChannel = await Promise.all(
          channels.map(async (c) => {
            const bvids = (c.pinnedBvIds ?? []).slice(0, 10)
            const pinnedPromise: Promise<Awaited<ReturnType<typeof biliApi.videos>> | null> = bvids.length
              ? biliApi.videos(bvids)
              : Promise.resolve(null)
            const [p, s, l, lat, pinned] = await Promise.allSettled([
              biliApi.profile(c.mid),
              biliApi.stats(c.mid),
              biliApi.live(c.mid),
              biliApi.latest(c.mid, ps),
              pinnedPromise,
            ])

            return {
              mid: c.mid,
              profile: p.status === 'fulfilled' ? p.value : null,
              stats: s.status === 'fulfilled' ? s.value : null,
              live: l.status === 'fulfilled' ? l.value : null,
              latest: lat.status === 'fulfilled' ? lat.value : null,
              pinned: pinned.status === 'fulfilled' ? pinned.value : null,
              errors: [p, s, l, lat, pinned]
                .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
                .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason))),
            }
          })
        )

        if (cancelled) return

        const profilesObj: Record<number, Awaited<ReturnType<typeof biliApi.profile>> | null> = {}
        const statsObj: Record<number, Awaited<ReturnType<typeof biliApi.stats>> | null> = {}
        const livesObj: Record<number, Awaited<ReturnType<typeof biliApi.live>> | null> = {}
        const latestObj: Record<number, Awaited<ReturnType<typeof biliApi.latest>> | null> = {}
        const pinnedObj: Record<number, Awaited<ReturnType<typeof biliApi.videos>> | null> = {}

        for (const r of perChannel) {
          profilesObj[r.mid] = r.profile
          statsObj[r.mid] = r.stats
          livesObj[r.mid] = r.live
          latestObj[r.mid] = r.latest
          pinnedObj[r.mid] = r.pinned
        }

        setBiliProfiles(profilesObj)
        setBiliStats(statsObj)
        setBiliLives(livesObj)
        setBiliLatest(latestObj)
        setBiliPinnedVideos(pinnedObj)

        const anySuccess = perChannel.some((r) => r.profile || r.stats || r.live || r.latest || r.pinned)
        const allErrors = perChannel.flatMap((r) => r.errors).filter(Boolean)
        if (!anySuccess && allErrors.length) setBiliError(allErrors[0])
      } catch (e) {
        if (!cancelled) setBiliError(e instanceof Error ? e.message : 'B站数据加载失败')
      } finally {
        if (!cancelled) setBiliLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

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
                  <Hero
                    {...content.hero}
                    side={
                      <div className="hero-bili">
                        <div className="hero-bili__tabs" role="tablist" aria-label="B站直播切换">
                          <mdui-button
                            className="hero-bili__tabbtn"
                            variant={heroBiliTab === 'me' ? 'tonal' : 'text'}
                            onClick={() => setHeroBiliTab('me')}
                            aria-selected={heroBiliTab === 'me'}
                          >
                            我
                          </mdui-button>
                          <mdui-button
                            className="hero-bili__tabbtn"
                            variant={heroBiliTab === 'friends' ? 'tonal' : 'text'}
                            onClick={() => setHeroBiliTab('friends')}
                            aria-selected={heroBiliTab === 'friends'}
                          >
                            朋友
                          </mdui-button>
                        </div>

                        <div className="hero-bili__body">
                          {biliLoading ? (
                            <div className="hero-bili__empty">正在拉取直播状态…</div>
                          ) : biliError ? (
                            <div className="hero-bili__empty">直播状态加载失败</div>
                          ) : (
                            (() => {
                              const me = bilibiliConfig.channels.find((c) => !c.isFriend) ?? bilibiliConfig.channels[0]
                              const friends = bilibiliConfig.channels.filter((c) => c.isFriend)
                              const picked = heroBiliTab === 'friends' ? friends : me ? [me] : []
                              if (!picked.length) return <div className="hero-bili__empty">暂无直播信息</div>

                              return (
                                <div className="hero-bili__list">
                                  {picked.map((c) => {
                                    const l = biliLives[c.mid]
                                    return l ? (
                                      <BiliLiveCard key={c.mid} label={c.label} isFriend={c.isFriend} live={l} />
                                    ) : (
                                      <div key={c.mid} className="hero-bili__empty">
                                        {c.label}：暂无直播信息
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()
                          )}
                        </div>
                      </div>
                    }
                  />
                  <Section title="快速入口" subtitle="先把常用的放这儿，省得你翻翻翻。">
                    <ContactBar contacts={content.contacts} variant="tonal" />
                  </Section>

                  <Section title="B站动态" subtitle="我和朋友们的 B站更新（由 Vercel 代理拉取）。">
                    {biliLoading ? (
                      <div className="empty-state">
                        <Icon name="schedule" className="empty-state__icon" />
                        <p className="empty-state__text">正在拉取 B站数据…</p>
                      </div>
                    ) : biliError ? (
                      <div className="empty-state">
                        <Icon name="warning" className="empty-state__icon" />
                        <p className="empty-state__text">B站数据加载失败：{biliError}</p>
                      </div>
                    ) : (
                      <div className="bili-section">
                        {bilibiliConfig.channels.map((c) => {
                          const p = biliProfiles[c.mid]
                          const s = biliStats[c.mid]
                          const latest = biliLatest[c.mid]?.items ?? []
                          const pinned = biliPinnedVideos[c.mid]?.items ?? []

                          return (
                            <div key={c.mid} className="bili-channel">
                              {p && s ? (
                                <BiliProfileCard label={c.label} isFriend={c.isFriend} profile={p} stats={s} />
                              ) : null}
                              {pinned.length ? <BiliVideoGrid title="置顶/精选" items={pinned} /> : null}
                              <BiliVideoGrid title="最新视频" items={latest} />
                            </div>
                          )
                        })}
                      </div>
                    )}
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
