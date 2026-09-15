---
title: "用 Astro 搭建个人网站"
description: "记录这次用 Astro 重建个人网站的过程和配置。"
date: 2025-01-05
tags: ["技术", "Astro", "网站"]
---

## 为什么是 Astro

之前用过 Next.js、Vite + React，功能都很强大，但对于个人网站来说有点重。Astro 的理念很打动我：

- **默认零 JS** — 除非明确需要，否则不发送 JavaScript 到客户端
- **内容优先** — Markdown/MDX 是一等公民
- **岛屿架构** — 只在需要的地方加交互

## 项目结构

```
src/
├── content/
│   ├── blog/          # Markdown 文章
│   └── config.ts      # Content Collection 配置
├── data/
│   └── site.ts        # 站点元信息
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── lib/
│   ├── github.ts      # GitHub API
│   └── utils.ts       # 工具函数
├── pages/
│   ├── index.astro
│   ├── blog/
│   ├── projects.astro
│   ├── about.astro
│   ├── contact.astro
│   └── rss.xml.ts
└── styles/
    └── global.css
```

## 关键配置

Content Collection 用 zod 做 schema 校验：

```typescript
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})
```

## 构建时数据

GitHub 仓库数据在构建时拉取，不需要 serverless：

```typescript
export async function getFeaturedRepos(count = 6) {
  const res = await fetch(API_URL, { headers })
  const repos = await res.json()
  return repos.filter(r => !r.fork && !r.archived).slice(0, count)
}
```

## 部署

推到 GitHub，Vercel 自动检测 Astro 并部署。没有复杂的 CI/CD，push 即上线。

## 总结

Astro 很适合个人网站：简单、快速、专注内容。如果你也在找一个静态站点方案，推荐试试。
