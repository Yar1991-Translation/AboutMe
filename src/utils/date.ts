/**
 * 将时间戳（毫秒或秒）格式化为 YYYY-MM-DD。
 * 提取自 BiliVideoGrid / RepoCard 重复逻辑。
 */
export const formatShortDate = (ts: number): string => {
  // 若是秒级时间戳（10位），转为毫秒
  const ms = ts < 1e12 ? ts * 1000 : ts
  return new Date(ms).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
