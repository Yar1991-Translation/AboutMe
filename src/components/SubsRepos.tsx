import SvgIcon from './SvgIcon'
import RepoCard from './RepoCard'
import type { GeneratedSubsRepos } from '../types/subs'
import generated from '../data/generated-subs-repos.json'
import { githubReposConfig } from '../config/githubRepos'

const data = generated as GeneratedSubsRepos

function SubsRepos() {
  if (data.error) {
    return (
      <div className="empty-state">
        <SvgIcon file="github.svg" className="empty-state__icon" size={28} />
        <p className="empty-state__text">GitHub 仓库列表拉取失败（网络/限流/设置都可能背锅）</p>
        <p className="empty-state__text" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
          你可以在 .env 里配置 GITHUB_USERNAME（可选再加 GITHUB_TOKEN 提高配额）
        </p>
      </div>
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
      <div className="empty-state">
        <SvgIcon file="github.svg" className="empty-state__icon" size={28} />
        <p className="empty-state__text">仓库列表被你“隐身术”了（当前过滤后为空）</p>
        <p className="empty-state__text" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-sm)' }}>
          去 src/config/githubRepos.ts 调 showAll / allowList / hideForks / hideArchived
        </p>
      </div>
    )
  }

  return (
    <div className="repo-grid">
      {filtered.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}

export default SubsRepos



