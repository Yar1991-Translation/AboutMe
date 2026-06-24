import type { GeneratedSubsRepos, GithubSubsRepo } from '../types/subs'
import type { GithubReposConfig } from '../config/githubRepos'

export const selectFeaturedRepos = (
  subsData: GeneratedSubsRepos,
  config: GithubReposConfig,
  limit = 6
): GithubSubsRepo[] => {
  if (subsData.error) return []

  const all = subsData.repos ?? []
  const filtered = all
    .filter((r) => (config.hideArchived ? !r.archived : true))
    .filter((r) => (config.hideForks ? !r.fork : true))
    .filter((r) => {
      const flag = config.allowList?.[r.fullName]
      return flag !== false
    })

  const allowKeys = Object.entries(config.allowList ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k)

  if (allowKeys.length) {
    const byKey = new Map(filtered.map((r) => [r.fullName, r]))
    return allowKeys
      .map((k) => byKey.get(k))
      .filter((r): r is GithubSubsRepo => Boolean(r))
      .slice(0, limit)
  }

  return [...filtered]
    .sort((a, b) => (b.stargazers - a.stargazers) || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}
