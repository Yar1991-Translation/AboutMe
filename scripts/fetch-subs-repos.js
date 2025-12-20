import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { dirname as pathDirname } from 'path'

const __dirname = pathDirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = `${__dirname}/../src/data/generated-subs-repos.json`

const getJson = async (url, headers) => {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API 失败: ${res.status} ${res.statusText}${text ? ` - ${text.slice(0, 200)}` : ''}`)
  }
  return await res.json()
}

async function fetchRepos() {
  const username = process.env.GITHUB_USERNAME
  const token = process.env.GITHUB_TOKEN

  if (!username) {
    console.log('⚠️  GitHub: 缺少 GITHUB_USERNAME，跳过仓库获取')
    return []
  }

  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'User-Agent': 'aboutme-build',
  }

  const repos = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`
    const data = await getJson(url, headers)
    if (!Array.isArray(data) || data.length === 0) break
    repos.push(...data)
    if (data.length < perPage) break
    page += 1
  }

  const mapped = repos
    .filter(r => !r.private) // 静态站点展示公共仓库即可
    .map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      description: r.description ?? '',
      homepage: r.homepage ?? '',
      language: r.language ?? '',
      topics: Array.isArray(r.topics) ? r.topics : [],
      stargazers: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      updatedAt: r.updated_at,
      createdAt: r.created_at,
      pushedAt: r.pushed_at,
      fork: !!r.fork,
      archived: !!r.archived,
    }))

  return mapped
}

async function main() {
  console.log('📝 开始获取 GitHub 仓库...\n')

  try {
    const repos = await fetchRepos()

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(
      OUTPUT_PATH,
      JSON.stringify({ repos, generatedAt: new Date().toISOString() }, null, 2),
      'utf-8',
    )

    console.log(`✅ GitHub: 获取到 ${repos.length} 个仓库`)
    console.log(`📁 数据已写入: ${OUTPUT_PATH}`)
  } catch (e) {
    console.error('❌ GitHub 获取失败:', e?.message ?? e)
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(
      OUTPUT_PATH,
      JSON.stringify({ repos: [], generatedAt: new Date().toISOString(), error: 'fetch_failed' }, null, 2),
      'utf-8',
    )
  }
}

main().catch(console.error)




