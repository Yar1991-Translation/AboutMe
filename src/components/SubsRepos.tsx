import RepoCard from './RepoCard'
import EmptyState from '@/primitives/EmptyState'
import type { GeneratedSubsRepos } from '../types/subs'
import generated from '../data/generated-subs-repos.json'
import { githubReposConfig } from '../config/githubRepos'
import styles from './SubsRepos.module.css'

const data = generated as GeneratedSubsRepos

export default function SubsRepos() {
  if (data.error) {
    return (
      <EmptyState
        text="GitHub 仓库列表拉取失败。你可以在 .env 里配置 GITHUB_USERNAME（可选再加 GITHUB_TOKEN 提高配额）。"
      />
    )
  }

  const filtered = (data.repos ?? [])
    .filter((r) => (githubReposConfig.hideArchived ? !r.archived : true))
    .filter((r) => (githubReposConfig.hideForks ? !r.fork : true))
    .filter((r) => {
      const flag = githubReposConfig.allowList?.[r.fullName]
      if (githubReposConfig.showAll) return flag !== false
      return flag === true
    })

  if (!filtered.length) {
    return (
      <EmptyState
        text="仓库列表被过滤清空了。去 src/config/githubRepos.ts 调 showAll / allowList / hideForks / hideArchived。"
      />
    )
  }

  return (
    <div className={styles.grid}>
      {filtered.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}
