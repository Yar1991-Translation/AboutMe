import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const title = process.argv[2]
if (!title) {
  console.error('用法: npm run new:experiment "实验标题"')
  process.exit(1)
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-|-$/g, '')

const today = new Date().toISOString().split('T')[0]

// status / progress / works / blocked / next are the whole point of the
// collection — an experiment entry without them is just a vague blog post.
const content = `---
title: "${title}"
description: ""
date: ${today}
status: seed
progress: 0
tags: []
stack: []
works: []
blocked: []
# next: ""
links: []
draft: true
---

## 它是什么

这个实验想解决什么问题。

## 为什么停下来

写清楚停在哪里。`blocked` 那一栏写不出来的话，这个实验大概不值得记。
`

const filePath = join(process.cwd(), 'src', 'content', 'experiments', `${slug}.md`)
if (existsSync(filePath)) {
  console.error(`文件已存在: ${filePath}`)
  process.exit(1)
}

writeFileSync(filePath, content, 'utf-8')
console.log(`✅ 已创建: ${filePath}`)
console.log('   状态可选: active / paused / dormant / seed / abandoned')
console.log('   记得把 draft: true 改为 false 才会出现在 /experiments')
