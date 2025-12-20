export type BiliChannel = {
  /** B站 mid */
  mid: number
  /** 显示名称（用于区分“我/朋友”） */
  label: string
  /** 是否朋友（用于 UI 打标） */
  isFriend?: boolean
  /** 置顶/精选视频 BV 号（可为空） */
  pinnedBvIds?: string[]
}

export const bilibiliConfig: {
  channels: BiliChannel[]
  latestCount: number
} = {
  // 你自己的 mid（从 space 链接可得：https://space.bilibili.com/517013017）
  // 朋友 mid：把 mid 填进来，并设 isFriend: true
  channels: [
    { mid: 517013017, label: '本可', pinnedBvIds: ['BV18vBwBDEtN']},
    { mid: 1912334158, label: '阿迪', isFriend: true, pinnedBvIds: ['BV1zk3ozgEeJ'] },
    // { mid: 234567, label: '朋友B', isFriend: true },
  ],
  latestCount: 6,
}


