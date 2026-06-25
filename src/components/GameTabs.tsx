import { useState } from 'react'
import GameCard from './GameCard'
import MinecraftProfile from './MinecraftProfile'
import RobloxProfileCard from './RobloxProfileCard'
import SvgIcon from './SvgIcon'
import EmptyState from '@/primitives/EmptyState'
import type { GeneratedGames } from '../types/games'
import generatedGames from '../data/generated-games.json'
import styles from './GameTabs.module.css'

const gameData = generatedGames as GeneratedGames

const TABS = [
  { key: 'steam', label: 'Steam', icon: 'steam.svg' },
  { key: 'roblox', label: 'Roblox', icon: 'roblox.svg' },
  { key: 'minecraft', label: 'Minecraft', icon: 'minecraft.svg' },
] as const

export default function GameTabs() {
  const [activeTab, setActiveTab] = useState('steam')

  const activeIndex = TABS.findIndex((t) => t.key === activeTab)

  const handleTabChange = (e: unknown) => {
    const idx = (e as { target?: HTMLElement & { activeTabIndex?: number } })?.target?.activeTabIndex
    if (typeof idx === 'number' && TABS[idx]) setActiveTab(TABS[idx].key)
  }

  const hasSteamGames = gameData.steam?.length > 0
  const hasRobloxGames = gameData.roblox?.length > 0
  const hasMinecraft = gameData.minecraft !== null

  return (
    <div className={styles.container}>
      <md-tabs active-tab-index={activeIndex} onChange={handleTabChange} aria-label="游戏平台">
        {TABS.map((t) => (
          <md-primary-tab key={t.key} inline-icon>
            <SvgIcon file={t.icon} slot="icon" size={18} />
            {t.label}
          </md-primary-tab>
        ))}
      </md-tabs>

      <div className={styles.content}>
        {activeTab === 'steam' && (
          <div className={styles.panel}>
            {hasSteamGames ? (
              <div className={styles.grid}>
                {gameData.steam.map((game) => (
                  <GameCard
                    key={game.appId}
                    title={game.title}
                    cover={game.cover}
                    subtitle={`${game.playtime} 小时`}
                    link={game.link}
                    linkLabel="Steam"
                    platform="steam"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="sports_esports"
                text="Steam 库还没抓到。去 .env 里把 STEAM_API_KEY / STEAM_ID 填上。"
              />
            )}
          </div>
        )}

        {activeTab === 'roblox' && (
          <div className={styles.panel}>
            {hasRobloxGames ? (
              <div className={styles.robloxSection}>
                {gameData.robloxProfile ? <RobloxProfileCard profile={gameData.robloxProfile} /> : null}
                <div className={styles.grid}>
                  {gameData.roblox.map((game) => (
                    <GameCard
                      key={game.gameId}
                      title={game.title}
                      cover={game.thumbnail}
                      link={game.link}
                      linkLabel="Roblox"
                      platform="roblox"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon="toys"
                text="Roblox 收藏为空。去 .env 配一下 ROBLOX_USER_ID，让我把你的收藏抬上来。"
              />
            )}
          </div>
        )}

        {activeTab === 'minecraft' && (
          <div className={styles.panel}>
            {hasMinecraft ? (
              <MinecraftProfile profile={gameData.minecraft!} />
            ) : (
              <EmptyState
                icon="grass"
                text="Minecraft 档案暂未加载。去 .env 填 MINECRAFT_USERNAME。"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
