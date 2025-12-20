import SvgIcon from './SvgIcon'
import type { GithubSubsRepo } from '../types/subs'

const fmtDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function RepoCard({ repo }: { repo: GithubSubsRepo }) {
  return (
    <mdui-card className="repo-card" variant="filled">
      <div className="repo-card__header">
        <div className="repo-card__title">
          <SvgIcon file="github.svg" size={18} />
          <span>{repo.name}</span>
        </div>
        <div className="repo-card__meta">
          {repo.archived ? <span className="repo-pill">ARCHIVED</span> : null}
          {repo.fork ? <span className="repo-pill">FORK</span> : null}
          {repo.language ? <span className="repo-pill">{repo.language}</span> : null}
          <span className="repo-pill">★ {repo.stargazers}</span>
          <span className="repo-pill">⎇ {repo.forks}</span>
        </div>
      </div>

      {repo.description ? (
        <p className="repo-card__desc">{repo.description}</p>
      ) : (
        <p className="repo-card__desc">这个仓库有点高冷：简介没写，但内容可能很顶。</p>
      )}

      {repo.topics?.length ? (
        <div className="repo-card__topics">
          {repo.topics.slice(0, 6).map((t) => (
            <span key={t} className="repo-topic">
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="repo-card__footer">
        <span className="repo-card__updated">最近更新：{fmtDate(repo.updatedAt)}</span>
        <mdui-button variant="tonal" href={repo.htmlUrl} target="_blank" rel="noreferrer">
          去仓库翻翻
        </mdui-button>
      </div>
    </mdui-card>
  )
}

export default RepoCard


