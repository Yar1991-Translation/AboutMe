import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const title = process.argv[2]
if (!title) {
  console.error('用法: npm run new:post "文章标题"')
  process.exit(1)
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-|-$/g, '')

const date = new Date().toISOString().split('T')[0]
const content = `---
title: "${title}"
description: ""
date: ${date}
tags: []
draft: true
---

## 开始写作

在这里写你的内容...
`

const filePath = join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`)
if (existsSync(filePath)) {
  console.error(`文件已存在: ${filePath}`)
  process.exit(1)
}

writeFileSync(filePath, content, 'utf-8')
console.log(`✅ 已创建: ${filePath}`)
console.log(`   记得把 draft: true 改为 false 再发布`)
