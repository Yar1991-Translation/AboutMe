import { spawnSync } from 'child_process'

const run = (args) => {
  const res = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

// 顺序执行（Windows 上 npm scripts 不用 &&）
run(['scripts/fetch-games.js'])
run(['scripts/fetch-subs-repos.js'])




