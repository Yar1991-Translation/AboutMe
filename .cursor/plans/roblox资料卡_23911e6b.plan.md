---
name: Roblox资料卡
overview: ""
todos: []
---

# Roblox 资料卡（构建时抓取）实施计划

## 目标

- 在 `ROBLOX_USER_ID` 已配置时，**构建前脚本**抓取 Roblox 用户资料（头像/昵称/用户名/简介/好友数/粉丝数/关注数），写入 `src/data/generated-games.json`。
- 在页面 Roblox 子 Tab 顶部展示 **Roblox 个人资料卡**（类似 MinecraftProfile 的风格），并提供跳转到 Roblox 主页。

## 关键设计

- **数据来源（无需登录）**
- 用户基本信息：`users.roblox.com/v1/users/{userId}`
- 头像（headshot）：`thumbnails.roblox.com/v1/users/avatar-headshot?userIds={userId}&size=150x150&format=Png&isCircular=false`
- 计数：
- 好友数：`friends.roblox.com/v1/users/{userId}/friends/count`
- 粉丝数：`friends.roblox.com/v1/users/{userId}/followers/count`
- 关注数：`friends.roblox.com/v1/users/{userId}/followings/count`
- **失败策略**：任一接口失败时降级为 `robloxProfile: null`（不影响站点构建与其他数据展示）。

## 改动点（文件）

- 脚本抓取扩展：[`scripts/fetch-games.js`](scripts/fetch-games.js)
- 新增 `fetchRobloxProfile()`，并合并进最终 `result`。
- 类型更新：[`src/types/games.ts`](src/types/games.ts)
- 新增 `RobloxProfile` 接口
- `GeneratedGames` 增加 `robloxProfile: RobloxProfile | null`
- 新组件：[`src/components/RobloxProfile.tsx`](src/components/RobloxProfile.tsx)
- 展示头像（带 fallback）、displayName/username、计数、简介与跳转按钮
- 页面接入：[`src/components/GameTabs.tsx`](src/components/GameTabs.tsx)
- Roblox Tab：在收藏游戏网格上方渲染 `RobloxProfile`（若为 null 则不展示）
- 样式补充：[`src/App.css`](src/App.css)
- 复用/对齐 `mc-profile` 的布局层级，新增 `roblox-profile` 对应样式（或共用一套 profile card 样式）。

## 验收方式

- 配置 `.env` 的 `ROBLOX_USER_ID` 后运行构建，`src/data/generated-games.json` 中出现 `robloxProfile` 字段。
- Roblox 子 Tab 顶部出现资料卡；未配置或抓取失败时不显示且不报错。

## 实施 todos

- `roblox-profile-fetch`: 扩展构建脚本抓取 Roblox 资料与计数并写入 JSON
- `roblox-types`: 更新 TS 类型以包含 robloxProfile
- `roblox-profile-ui`: 新增 RobloxProfile 组件并在 GameTabs 的