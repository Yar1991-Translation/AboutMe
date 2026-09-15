export interface GithubRepo {
  name: string
  fullName: string
  description: string | null
  url: string
  stars: number
  forks: number
  language: string | null
  updatedAt: string
  topics: string[]
}

const USERNAME = 'Yar1991-Translation'
const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=20`

export async function getFeaturedRepos(count = 6): Promise<GithubRepo[]> {
  try {
    const token = import.meta.env.GITHUB_TOKEN
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'yatmt-site',
    }
    if (token) {
      headers.Authorization = `token ${token}`
    }

    const res = await fetch(API_URL, { headers })
    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}`)
      return []
    }

    const repos = await res.json()
    return repos
      .filter((r: any) => !r.fork && !r.archived)
      .map((r: any) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        updatedAt: r.updated_at,
        topics: r.topics || [],
      }))
      .sort((a: GithubRepo, b: GithubRepo) => b.stars - a.stars)
      .slice(0, count)
  } catch (err) {
    console.warn('Failed to fetch GitHub repos:', err)
    return []
  }
}
