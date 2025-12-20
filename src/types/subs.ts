export type GithubSubsRepo = {
  id: number
  name: string
  fullName: string
  htmlUrl: string
  description: string
  homepage: string
  language: string
  topics: string[]
  stargazers: number
  forks: number
  updatedAt: string
  createdAt: string
  pushedAt: string
  fork: boolean
  archived: boolean
}

export type GeneratedSubsRepos = {
  repos: GithubSubsRepo[]
  generatedAt: string
  error?: string
}


