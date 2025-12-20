import type { CSSProperties } from 'react'

type SvgIconProps = {
  /** 位于 public/svgs 下的文件名，如：github.svg */
  file: string
  className?: string
  slot?: string
  size?: number
  title?: string
}

function SvgIcon({ file, className = '', slot, size = 20, title }: SvgIconProps) {
  const url = `${import.meta.env.BASE_URL}svgs/${file}`

  const style: CSSProperties = {
    width: size,
    height: size,
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
  }

  return (
    <span
      className={`svg-mask-icon ${className}`}
      style={style}
      slot={slot}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      title={title}
    />
  )
}

export default SvgIcon




