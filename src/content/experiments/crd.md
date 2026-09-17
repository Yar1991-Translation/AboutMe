---
title: CRD
description: Roblox 下载站的前端。四个下载入口、多线路 gh-proxy、RDD 免安装包。Lit + MD3，2026 年 3 月之后没再动过。
date: 2026-03-14
updated: 2026-03-31
status: paused
progress: 70
tags: ['站点', 'Roblox']
stack: ['Lit', 'TypeScript', 'Vite', 'Material Web', 'Tailwind', 'Node']
works:
  - 四个下载入口都在：Windows / macOS、Android、第三方启动器
  - 多条 gh-proxy 线路可选，切换即时生效
  - RDD 免安装包在浏览器里打包（jszip），不过服务器
  - MD3 明暗主题，配色由 material-color-utilities 生成
  - 更新日志按日期成文件，加一篇不用碰组件
  - Logo 是 currentColor 的内联 SVG，跟随主题变量
blocked:
  - 公告要单独跑一个 Node 进程才能用，站点因此不是纯静态的
  - 公告只做到 p2 就停了，没有再往下
  - TODO.md 和 PLAN.md 在 3-19 被删掉，之后没有路线文件
  - 国内访问靠换 DNS 解析解决，不是代码层面的事，下次慢还得从外面想办法
next: 公告停在 p2。要么把它收成静态 JSON，要么就别再假装这个站是纯静态的。
links:
  - label: GitHub
    href: https://github.com/Yar1991-Translation/CRD
---

## 这是什么

Roblox 下载站的前端。四个下载入口：Windows / macOS、Android、第三方启动器，外加多线路的 gh-proxy 下载和 RDD 免安装包生成。

用 Lit 而不是框架，是因为每一块本来就是一个自定义元素。导航栏、Hero、公告、更新日志、RDD 弹窗各占一个组件文件，中间没有需要同步的框架状态。第二次构建入口是 admin，站在同一个 Vite 配置里。

## 更新日志是文件

`src/logs/` 里按日期放 markdown，几个自定义元素（`<crd-log-hero>`、`<crd-log-grid>`、`<crd-log-card>`）负责把它渲染出来。加一篇日志就是丢一个文件进去，不用碰组件代码。

最后一篇是 3-30。

## 停在哪

三月十四号起手，三十一号之后没再动过。中间两周做得挺密：MD3 明暗主题、更新日志系统、公告、国内解析加速、Logo 从写死颜色的资源换成 `currentColor` 驱动的内联 SVG。

三月十九号那天连着删掉了 `TODO.md` 和 `PLAN.md`。之后 `src/logs` 里只剩更新记录，没有下一版要做什么。

## 唯一不静态的地方

站点本身是纯静态的，但公告默认打 `/api/announcements`，得自己架一个 Node 进程。README 为这一件事写了整套 Nginx 反代配置和一个最小服务示例。

这是整个项目里唯一一个让「纯静态」不成立的东西，也是公告停在 p2 的原因。

## 国内访问

三月二十五号动的是 DNS，把 `cname.vercel-dns.com` 换成了 `cname-china.vercel-dns.com`。当时确实好了。但解决方式在解析层，不在代码层，下次再慢还是得从外面想办法。
