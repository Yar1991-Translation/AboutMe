---
title: "Markdown 语法全集"
description: "把 Markdown 的每一种语法都用一遍，用来检查站点的渲染。"
date: 2026-09-16
tags: ["参考", "Markdown", "排版"]
---

这篇把所有常用语法都写了一遍，纯粹是为了看渲染效果。看完可以删掉，或者把 frontmatter 里的 `draft` 改成 `true` 收起来。

## 标题

六个级别各自长什么样：

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

正文接在标题下面，看看间距是否合适。

## 行内文本

**粗体**、*斜体*、***粗斜体***、~~删除线~~、`行内代码`、普通文字。

中文里的**粗体**和英文的 **bold** 混排时，字重变化是否一致。

## 段落与换行

这是第一段。段落之间空一行即可。

这是第二段。行尾加两个空格  
可以强制换行，第二行会紧接在下面。

不加空格的话，
这行会被当作同一段的一部分。

## 引用

> 单层引用。左边有一条克莱因蓝的断线，那是这个站定的样式。
>
> 同一个引用里的第二段。

> 外层引用
>
> > 嵌套的内层引用
> >
> > > 再嵌一层

> 引用里也可以有 **格式**、`代码` 和[链接](#链接)。

## 列表

无序列表：

- 第一项
- 第二项
  - 嵌套项
  - 另一个嵌套项
    - 再深一层
- 第三项

有序列表：

1. 第一项
2. 第二项
   1. 嵌套项
   2. 另一个嵌套项
3. 第三项

混合：

1. 有序
   - 里面套无序
   - 再来一个
2. 继续有序

## 任务列表

- [x] 已经做完的
- [x] 另一件做完的
- [ ] 还没做的
- [ ] 也没做的

## 代码

行内代码像 `const x = 1` 这样，或者一段命令 `npm run build`。

带语法高亮的代码块：

```js
export function sortPostsByDate(posts) {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}
```

```css
.grid-rule--accent {
  background: var(--blue);
  opacity: 0.3;
}
```

```bash
npm install
npm run build
npm run smoke:motion
```

```json
{
  "name": "yatmt-site",
  "type": "module",
  "private": true
}
```

```html
<blockquote class="quote--plain">一句引用</blockquote>
```

没有语言标注的代码块：

```
纯文本代码块
第二行
```

## 表格

| 语法 | 写法 | 说明 |
| :--- | :---: | ---: |
| 粗体 | `**文字**` | 字重加粗 |
| 斜体 | `*文字*` | 倾斜 |
| 删除线 | `~~文字~~` | 中划线 |
| 代码 | `` `文字` `` | 等宽字体 |

左中右三种对齐：

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| a | b | c |
| 长一点的内容 | 短 | 1,234 |

## 链接

[行内链接](https://markdown.com.cn "Markdown 中文文档")

[引用式链接][md-cn]，定义写在下面。

[相对链接](/about) 指向站内页面。

自动链接：<https://example.com>

裸链接也会被自动识别：https://commonmark.org

[md-cn]: https://markdown.com.cn/basic-syntax/

## 图片

![站点图标](/favicon.svg "这是 title")

## 分隔线

上面是内容。

---

下面是内容。

## 脚注

Markdown 支持脚注[^1]，也可以给多个[^note]。

[^1]: 这是一条脚注，会被渲染到文章末尾。
[^note]: 这是第二条脚注，支持 **格式** 和 `代码`。

## 转义字符

\*这不是斜体\*

\# 这不是标题

\[这不是链接\](https://example.com)

反斜杠本身：\\

## 内嵌 HTML

<kbd>Ctrl</kbd> + <kbd>C</kbd>

<details>
<summary>点击展开</summary>

折叠起来的内容。Markdown 在 HTML 块内部**不一定**会被解析，取决于实现，这里就是原样输出的。

</details>

<span style="color: var(--blue);">带内联样式的 span</span>

## 收尾

全部语法过完。看看哪一块的排版还需要调。
