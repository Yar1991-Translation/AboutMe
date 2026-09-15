# ARCHIVE

个人档案站。Astro 静态生成，GSAP 驱动动效，无追踪、无后端。

```bash
npm install
npm run dev          # 开发
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
npm run new:post "标题"   # 新建笔记（默认 draft: true）
npm run smoke:motion     # 冒烟测试动效层（需要 jsdom，见下）
```

## 视觉约定

- **克莱因蓝 `#002FA7` 是唯一的彩色。** 其余全部是 `--bg` / `--ink` / `--line` 之间的灰度。
- 瑞士栅格：`.wrap` 限宽 + `.grid-12` 12 列。
- 蓝图语言：1px 线、`.measure` 标注、`.infobox` 图框、`GeometricFrame` 浮动几何。
- 明暗主题通过 `[data-theme]` 挂在 `<html>` 上。

## 动效层（`src/scripts/motion/`）

动效不是写在组件里的，而是一组往注册表里登记的效果模块，由一个内核统一调度。

```
kernel.ts      注册表、断点分级、失败隔离、装卸
state.ts       单帧总线 + 速度/滚动共享状态
guards.ts      选择器安全检查
index.ts       入口，只负责事件接线
effects/       intro reveal velocity parallax ambient ghosts grid hud progress cursor interactions
```

### 两条必须遵守的规则

**1. CSS 和 GSAP 不能同时写同一个元素的 `transform`。**

带 `fill-mode: both` 的 CSS 关键帧优先级高于内联样式，会静默吃掉 GSAP 写进去的一切。所以：

- CSS 只负责**由类或伪类驱动的状态**：`:hover`、`:focus-visible`、`[data-theme]`。
- GSAP 负责**由滚动、指针、时间轴驱动的一切**。
- 静态偏移（固定挪 5px、倾斜 0.5°）算**布局**，用 `position/top/left` 写，不用 `transform`。倾斜用独立的 `rotate` 属性（它和 `transform` 不冲突）。
- 伪元素永远归 CSS。GSAP 想动它就通过自定义属性间接驱动。

**2. 绝不把伪元素选择器交给 GSAP。**

`gsap.utils.toArray('a::before')` 会把它直接转给 `querySelectorAll`，而伪元素不是合法选择器，**抛 `SyntaxError`**。这个异常发生在动画初始化回调里，会连带干掉后面注册的所有效果。

这不是假设——本站的动效层曾经就是这样整体失效的：`Animations.astro` 第 80 行的一句 `.sec-no::before` 让之后约 30 个效果（包括全部视差）从未执行过，而构建完全看不出来。所有选择器先过 `guards.ts` 的 `qa()`。

### 失败隔离

每个效果有独立的 `gsap.matchMedia` 上下文和独立的 `try/catch`。一个效果抛错只会杀掉它自己的 ScrollTrigger 并回滚它自己的内联样式，其余照常运行，`<html>` 上会留下 `data-motion-failed-<id>` 供排查。

### 断点分级

| tier | 条件 | 表现 |
|---|---|---|
| 0 | `prefers-reduced-motion: reduce` | 全部关闭，内容完全可见 |
| 1 | `max-width: 960px` | 幅度减半，无 HUD、无光标准星 |
| 2 | `min-width: 961px` | 完整 |

961/960 是刻意的：样式表的移动端断点是 `max-width: 960px`，之前动画用的是 `min-width: 960px`，两者在 960px 重叠，且 960px 以下完全没有动画。

### 页面切换

`BaseLayout` 引入了 `astro:transitions` 的 `ViewTransitions`。注意两点：

- 提升后的模块脚本**在一次会话里只执行一次**，导航后必须靠 `astro:page-load` 监听器重新初始化，不能靠重新执行文件。
- `swapRootAttributes` 会剥掉 `<html>` 上所有不以 `data-astro-` 开头的属性，所以 `data-theme` 和 `js-motion` 每次导航后都要重建——见 `index.ts` 的 `reassertRootState`。

## 冒烟测试

`scripts/smoke-motion.mjs` 用 jsdom 加载构建产物，检查**每个效果有没有抛错**——也就是构建永远发现不了的那一类问题。

需要 jsdom：

```bash
npm install --no-save jsdom
npm run build
npm run smoke:motion
```

## 已知情况

- 博客当前为空，构建时会打印 `The collection "blog" does not exist or is empty.` 这是预期状态。
- `@astrojs/sitemap` 已移除：它在 Astro 4.16 上会读一个 4.x 不提供的内部字段（`_routes`）并让构建崩溃。要加回来得锁一个兼容 4.x 的版本。
