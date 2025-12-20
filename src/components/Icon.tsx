type IconProps = {
  name: string
  className?: string
  style?: React.CSSProperties
  slot?: string
}

/**
 * 自定义图标组件，直接使用 Material Symbols 字体
 * 绕过 mdui-icon 的 Shadow DOM 字体加载问题
 */
function Icon({ name, className = '', style, slot }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={style}
      slot={slot}
    >
      {name}
    </span>
  )
}

export default Icon
