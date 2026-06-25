import SvgIcon from '@/components/SvgIcon'
import Icon from '@/components/Icon'

/**
 * 根据 URL 自动识别社交平台并返回对应图标。
 * 提取自 Hero.tsx / LinkCard.tsx 重复逻辑。
 */
export const renderSocialIcon = (href: string, fallback?: string) => {
  const h = href.toLowerCase()
  if (h.includes('bilibili.com')) return <SvgIcon file="bilibili.svg" />
  if (h.includes('github.com')) return <SvgIcon file="github.svg" />
  if (h.includes('youtube.com') || h.includes('youtu.be')) return <SvgIcon file="youtube.svg" />
  return fallback ? <Icon name={fallback} /> : null
}
