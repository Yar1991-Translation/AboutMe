/**
 * GitHub 仓库展示配置（改这里就能控制显示/隐藏）
 *
 * - showAll: true  → 展示抓到的所有仓库（默认）
 * - showAll: false → 只展示 allowList 里标记为 true 的仓库
 * - allowList: 以 fullName 为 key（形如：Owner/Repo），true 显示，false 隐藏
 * - hideForks: 是否隐藏 fork 的仓库
 * - hideArchived: 是否隐藏归档仓库
 */
import { ensureBoolean, ensureRecord } from '../utils/config'

export type GithubReposConfig = {
  showAll: boolean
  hideForks: boolean
  hideArchived: boolean
  allowList: Record<string, boolean>
}

const rawConfig = {
  showAll: true,
  hideForks: false,
  hideArchived: true,
  allowList: {
    // 'Yar1991-Translation/Subtitle-Sharing': true,
    // 'Yar1991-Translation/LoArchive': false,
  } as Record<string, boolean>,
}

const rawAllowList = ensureRecord(rawConfig.allowList)

export const githubReposConfig: GithubReposConfig = {
  showAll: ensureBoolean(rawConfig.showAll, true),
  hideForks: ensureBoolean(rawConfig.hideForks, false),
  hideArchived: ensureBoolean(rawConfig.hideArchived, true),
  allowList: Object.fromEntries(
    Object.entries(rawAllowList).map(([key, value]) => [key, ensureBoolean(value, false)])
  ),
}




