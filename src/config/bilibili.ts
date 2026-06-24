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

import { ensureArray, ensureBoolean, ensureNumber, ensureString } from '../utils/config'

export type BiliConfig = {
  channels: BiliChannel[]
  latestCount: number
}

const rawConfig = {
  // 你自己的 mid（从 space 链接可得：https://space.bilibili.com/517013017）
  // 朋友 mid：把 mid 填进来，并设 isFriend: true
  channels: [
    { mid: 517013017, label: '本可', pinnedBvIds: ['BV18vBwBDEtN']},
    { mid: 1912334158, label: '阿迪', isFriend: true, pinnedBvIds: ['BV1zk3ozgEeJ'] },
    // { mid: 234567, label: '朋友B', isFriend: true },
  ],
  latestCount: 6,
}

const normalizedChannels = ensureArray<BiliChannel>(rawConfig.channels)
  .map((c) => ({
    mid: ensureNumber(c.mid, 0),
    label: ensureString(c.label, ''),
    isFriend: ensureBoolean(c.isFriend, false),
    pinnedBvIds: ensureArray<string>(c.pinnedBvIds).filter((id) => typeof id === 'string' && id.trim().length > 0),
  }))
  .filter((c) => c.mid > 0 && c.label)

export const bilibiliConfig: BiliConfig = {
  channels: normalizedChannels,
  latestCount: Math.max(1, ensureNumber(rawConfig.latestCount, 6)),
}


