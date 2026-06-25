import { Suspense, lazy, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Section from '../components/Section'
import ContactBar from '../components/ContactBar'
import Hero from '../components/Hero'
import GameCard from '../components/GameCard'
import RepoCard from '../components/RepoCard'
import BiliLiveCard from '../components/BiliLiveCard'
import EmptyState from '@/primitives/EmptyState'
import Button from '@/primitives/Button'
import { content } from '../content'
import generatedSubs from '../data/generated-subs-repos.json'
import generatedGames from '../data/generated-games.json'
import { githubReposConfig } from '../config/githubRepos'
import { bilibiliConfig } from '../config/bilibili'
import type { GeneratedSubsRepos, GithubSubsRepo } from '../types/subs'
import type { GeneratedGames } from '../types/games'
import { selectFeaturedRepos } from '../utils/repos'
import { selectSteamTop } from '../utils/games'
import { useBiliData } from '../hooks/useBiliData'
import { useInView } from '../hooks/useInView'
import styles from './HomePage.module.css'

const BiliSection = lazy(() => import('../sections/BiliSection'))

const emptyFallback = (
  <Section title="B站动态" subtitle="我和朋友们的 B站更新（由 Vercel 代理拉取）。">
    <EmptyState icon="hourglass_empty" text="B站动态加载中…" />
  </Section>
)

const subsData = generatedSubs as GeneratedSubsRepos
const gameData = generatedGames as GeneratedGames

export default function HomePage() {
  const navigate = useNavigate()
  const [heroBiliTab, setHeroBiliTab] = useState<'me' | 'friends'>('me')
  const { ref: biliRef, inView: biliInView } = useInView<HTMLDivElement>({ rootMargin: '200px', threshold: 0.1 })
  const [idleReady, setIdleReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const requestIdle =
      window.requestIdleCallback ??
      ((cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void) =>
        window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 600))
    const cancelIdle = window.cancelIdleCallback ?? ((id: number) => window.clearTimeout(id))
    const id = requestIdle(() => setIdleReady(true), { timeout: 1500 })
    return () => cancelIdle(id)
  }, [])

  const shouldLoadBili = biliInView || idleReady
  const biliState = useBiliData({ enabled: shouldLoadBili })

  const featuredRepos = selectFeaturedRepos(subsData, githubReposConfig, 6)
  const steamTop = selectSteamTop(gameData, 6)

  const renderHeroBiliBody = () => {
    if (!biliState.hasRequested) return <div className={styles.biliEmpty}>直播状态准备中…</div>
    if (biliState.loading) return <div className={styles.biliEmpty}>正在拉取直播状态…</div>
    if (biliState.error) return <div className={styles.biliEmpty}>直播状态加载失败</div>

    const me = bilibiliConfig.channels.find((c) => !c.isFriend) ?? bilibiliConfig.channels[0]
    const friends = bilibiliConfig.channels.filter((c) => c.isFriend)
    const picked = heroBiliTab === 'friends' ? friends : me ? [me] : []
    if (!picked.length) return <div className={styles.biliEmpty}>暂无直播信息</div>

    return (
      <div className={styles.biliList}>
        {picked.map((c) => {
          const l = biliState.lives[c.mid]
          return l ? (
            <BiliLiveCard key={c.mid} label={c.label} isFriend={c.isFriend} live={l} />
          ) : (
            <div key={c.mid} className={styles.biliEmpty}>
              {c.label}：暂无直播信息
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Hero
        {...content.hero}
        side={
          <div className={styles.heroBili}>
            <div className={styles.heroBiliTabs} role="tablist" aria-label="B站直播切换">
              <Button
                variant={heroBiliTab === 'me' ? 'tonal' : 'text'}
                className={styles.tabBtn}
                onClick={() => setHeroBiliTab('me')}
                aria-selected={heroBiliTab === 'me'}
              >
                我
              </Button>
              <Button
                variant={heroBiliTab === 'friends' ? 'tonal' : 'text'}
                className={styles.tabBtn}
                onClick={() => setHeroBiliTab('friends')}
                aria-selected={heroBiliTab === 'friends'}
              >
                朋友
              </Button>
            </div>
            <div className={styles.heroBiliBody}>{renderHeroBiliBody()}</div>
          </div>
        }
      />

      <Section title="快速入口" subtitle="先把常用的放这儿，省得你翻翻翻。">
        <ContactBar contacts={content.contacts} variant="tonal" />
      </Section>

      <div ref={biliRef}>
        <Suspense fallback={emptyFallback}>
          <BiliSection
            loading={biliState.loading}
            error={biliState.error}
            hasRequested={biliState.hasRequested}
            profiles={biliState.profiles}
            stats={biliState.stats}
            latest={biliState.latest}
            pinned={biliState.pinned}
          />
        </Suspense>
      </div>

      <Section
        title={Object.keys(githubReposConfig.allowList ?? {}).some((k) => githubReposConfig.allowList[k]) ? '精选仓库' : '仓库速览'}
        subtitle="置顶优先；没置顶就按「看起来最像精选」的来。"
        actions={
          <Button variant="text" onClick={() => navigate('/repos')}>
            去仓库页
          </Button>
        }
      >
        {subsData.error ? (
          <EmptyState icon="folder" text="仓库数据没拉到（网络/限流/配置都可能背锅）" />
        ) : featuredRepos.length ? (
          <div className={styles.repoGrid}>
            {featuredRepos.map((repo: GithubSubsRepo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        ) : (
          <EmptyState icon="folder_off" text="仓库列表目前是空的（或被过滤规则清空了）" />
        )}
      </Section>

      <Section
        title="最近在玩"
        subtitle="Steam Top N（按抓取顺序）。"
        actions={
          <Button variant="text" onClick={() => navigate('/games')}>
            去游戏页
          </Button>
        }
      >
        {steamTop.length ? (
          <div className={styles.gameGrid}>
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
          <EmptyState icon="sports_esports" text="Steam 还没抓到（去 .env 填 STEAM_API_KEY / STEAM_ID）" />
        )}
      </Section>
    </>
  )
}
