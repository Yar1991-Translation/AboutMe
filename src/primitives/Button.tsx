import type { ReactNode, MouseEventHandler } from 'react'
import Icon from '@/components/Icon'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'

type ButtonProps = {
  variant?: ButtonVariant
  /** Material Symbols 图标名（前置） */
  icon?: string
  /** 尾随图标 */
  trailingIcon?: string
  href?: string
  target?: string
  rel?: string
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
  className?: string
  'aria-label'?: string
  children?: ReactNode
}

const TAG: Record<ButtonVariant, string> = {
  filled: 'md-filled-button',
  tonal: 'md-filled-tonal-button',
  outlined: 'md-outlined-button',
  text: 'md-text-button',
  elevated: 'md-elevated-button',
}

/**
 * 统一按钮原语：封装 @material/web 各 variant 标签、图标插槽与链接/按钮差异。
 */
export default function Button({
  variant = 'filled',
  icon,
  trailingIcon,
  href,
  target,
  rel,
  onClick,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const Tag = TAG[variant] as 'md-filled-button'
  const ariaLabel = rest['aria-label']

  return (
    <Tag
      className={className}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...(trailingIcon ? { 'trailing-icon': true } : {})}
    >
      {icon && !trailingIcon && <Icon name={icon} slot="icon" />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} slot="icon" />}
    </Tag>
  )
}
