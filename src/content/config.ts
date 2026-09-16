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

/**
 * Experiments — 做了一半的东西。
 *
 * 这个集合记录的是「没做完」而不是「做完了」：所以它比 blog 多出来的字段全部
 * 指向未完成状态 —— status 说明它现在是什么状态，progress 是粗到不能再粗的
 * 完成度，works / blocked 分开写「还能跑的部分」和「卡住的地方」。
 *
 * works 和 blocked 是两个数组而不是一段自由文本，是因为一段自由文本最后一定
 * 会退化成一段含糊的辩解；拆成条目之后，写不出来就说明这个实验其实没什么可
 * 记的。
 */
const experiments = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** 起手时间 */
    date: z.coerce.date(),
    /** 最后一次真的动它 */
    updated: z.coerce.date().optional(),
    status: z.enum(['active', 'paused', 'dormant', 'seed', 'abandoned']).default('seed'),
    /** 0–100，粗估 */
    progress: z.number().min(0).max(100).default(0),
    tags: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    /** 现在还能跑起来的部分 */
    works: z.array(z.string()).default([]),
    /** 卡住的地方 —— 这一项为空说明它不该停在这 */
    blocked: z.array(z.string()).default([]),
    /** 下一步打算做什么。可以不写，但写了就得是真的下一步 */
    next: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog, experiments }
