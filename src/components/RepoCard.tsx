import SvgIcon from './SvgIcon'
import Card from '@/primitives/Card'
import Button from '@/primitives/Button'
import type { GithubSubsRepo } from '../types/subs'
import { formatShortDate } from '@/utils/date'
import styles from './RepoCard.module.css'

export default function RepoCard({ repo }: { repo: GithubSubsRepo }) {
  return (
    <Card variant="filled" className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          <SvgIcon file="github.svg" size={18} />
          <span>{repo.name}</span>
        </div>
        <div className={styles.meta}>
          {repo.archived ? <span className={styles.pill}>ARCHIVED</span> : null}
          {repo.fork ? <span className={styles.pill}>FORK</span> : null}
          {repo.language ? <span className={styles.pill}>{repo.language}</span> : null}
          <span className={styles.pill}>★ {repo.stargazers}</span>
          <span className={styles.pill}>⎇ {repo.forks}</span>
        </div>
      </div>

      <p className={styles.desc}>
        {repo.description || '这个仓库有点高冷：简介没写，但内容可能很顶。'}
      </p>

      {repo.topics?.length ? (
        <div className={styles.topics}>
          {repo.topics.slice(0, 6).map((t) => (
            <span key={t} className={styles.topic}>
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <span className={styles.updated}>最近更新：{formatShortDate(new Date(repo.updatedAt).getTime())}</span>
        <Button variant="tonal" href={repo.htmlUrl} target="_blank" rel="noreferrer">
          去仓库翻翻
        </Button>
      </div>
    </Card>
  )
}
