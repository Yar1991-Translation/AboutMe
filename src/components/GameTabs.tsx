import { useState } from 'react'
import type { FormEvent } from 'react'
import GameCard from './GameCard'
import MinecraftProfile from './MinecraftProfile'
import RobloxProfileCard from './RobloxProfileCard'
import SvgIcon from './SvgIcon'
import type { GeneratedGames } from '../types/games'
import generatedGames from '../data/generated-games.json'

const gameData = generatedGames as GeneratedGames

const extractMduiTabsValue = (event: unknown): string | undefined => {
  const e = event as {
    detail?: { value?: string }
    nativeEvent?: { detail?: { value?: string } }
    target?: { value?: string }
    currentTarget?: { value?: string }
  }
  return (
    e?.detail?.value ??
    e?.nativeEvent?.detail?.value ??
    e?.target?.value ??
    e?.currentTarget?.value
  )
}

function GameTabs() {
  const [activeSubTab, setActiveSubTab] = useState('steam')

  const handleSubTabChange = (event: Event | FormEvent<HTMLElement>) => {
    const extracted = extractMduiTabsValue(event)
    if (typeof extracted === 'string' && extracted.length > 0) setActiveSubTab(extracted)
  }

  const hasSteamGames = gameData.steam && gameData.steam.length > 0
  const hasRobloxGames = gameData.roblox && gameData.roblox.length > 0
  const hasMinecraft = gameData.minecraft !== null

  return (
    <div className="game-tabs-container">
      <mdui-tabs
        value={activeSubTab}
        onChange={handleSubTabChange}
        variant="secondary"
        className="game-sub-tabs"
      >
        <mdui-tab value="steam">
          <SvgIcon file="steam.svg" slot="icon" />
          Steam
        </mdui-tab>
        <mdui-tab value="roblox">
          <SvgIcon file="roblox.svg" slot="icon" />
          Roblox
        </mdui-tab>
        <mdui-tab value="minecraft">
          <SvgIcon file="minecraft.svg" slot="icon" />
          Minecraft
        </mdui-tab>
      </mdui-tabs>

      {/* 使用条件渲染代替 mdui-tab-panel */}
      <div className="game-sub-content">
        {activeSubTab === 'steam' && (
          <div className="game-sub-panel">
            {hasSteamGames ? (
              <div className="game-grid">
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
              <div className="empty-state">
                <SvgIcon file="steam.svg" className="empty-state__icon" size={28} />
                <p className="empty-state__text">Steam 库还没抓到（可能在躲猫猫）</p>
                <p className="empty-state__text" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
                  去 .env 里把 STEAM_API_KEY / STEAM_ID 填上，马上开箱你的“游戏山”
                </p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'roblox' && (
          <div className="game-sub-panel">
            {hasRobloxGames ? (
              <div className="game-tabs-roblox">
                {gameData.robloxProfile ? <RobloxProfileCard profile={gameData.robloxProfile} /> : null}
                <div className="game-grid">
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
              <div className="empty-state">
                <SvgIcon file="roblox.svg" className="empty-state__icon" size={28} />
                <p className="empty-state__text">Roblox 收藏为空（也许你在偷偷攒？）</p>
                <p className="empty-state__text" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
                  去 .env 配一下 ROBLOX_USER_ID，让我把你的收藏“抬上来”
                </p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'minecraft' && (
          <div className="game-sub-panel">
            {hasMinecraft ? (
              <MinecraftProfile profile={gameData.minecraft!} />
            ) : (
              <div className="empty-state">
                <SvgIcon file="minecraft.svg" className="empty-state__icon" size={28} />
                <p className="empty-state__text">Minecraft 档案暂未加载（史蒂夫：我先溜了）</p>
                <p className="empty-state__text" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
                  去 .env 填 MINECRAFT_USERNAME，就能把你的皮肤/头像“端上桌”
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameTabs




