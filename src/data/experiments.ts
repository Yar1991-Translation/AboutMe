/**
 * 实验状态表。
 *
 * 状态是这个集合里信息量最大的字段。一个实验做完了没有意义不大，为什么停在
 * 这里才是要写的。光给一个标签不够，所以每个状态都带一句说明。
 *
 * 顺序就是展示顺序：还在动的在最上面，已经想清楚不做的沉到底下。日期只在同一
 * 状态内部参与排序。
 */
export const EXPERIMENT_STATUS = {
  active: {
    label: 'Active',
    zh: '在动',
    code: 'ST—01',
    note: '最近还在改',
  },
  paused: {
    label: 'Paused',
    zh: '搁置',
    code: 'ST—02',
    note: '知道该做什么，但没在做',
  },
  dormant: {
    label: 'Dormant',
    zh: '休眠',
    code: 'ST—03',
    note: '没删，也没再打开过',
  },
  seed: {
    label: 'Seed',
    zh: '起手',
    code: 'ST—04',
    note: '只有一个念头',
  },
  abandoned: {
    label: 'Abandoned',
    zh: '放弃',
    code: 'ST—05',
    note: '想清楚了，不做',
  },
} as const

export type ExperimentStatus = keyof typeof EXPERIMENT_STATUS

/** 展示顺序，也是 CSS 里 .xcard--<status> 的取值顺序 */
export const STATUS_ORDER: ExperimentStatus[] = ['active', 'paused', 'dormant', 'seed', 'abandoned']

export const statusOf = (s: string) =>
  EXPERIMENT_STATUS[s as ExperimentStatus] ?? EXPERIMENT_STATUS.seed
