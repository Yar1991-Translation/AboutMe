/// <reference types="react" />

/**
 * @material/web 自定义元素的 JSX 声明。
 * 元素行为类型由库自带，这里只声明 JSX 内联标签可接受的属性。
 */
type MdBaseProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>

type MdButtonProps = MdBaseProps & {
  disabled?: boolean
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  value?: string
  name?: string
  'trailing-icon'?: boolean
}

type MdIconButtonProps = MdBaseProps & {
  disabled?: boolean
  href?: string
  target?: string
  'aria-label'?: string
  selected?: boolean
  toggle?: boolean
  type?: 'button' | 'submit' | 'reset'
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': MdButtonProps
      'md-outlined-button': MdButtonProps
      'md-text-button': MdButtonProps
      'md-elevated-button': MdButtonProps
      'md-filled-tonal-button': MdButtonProps
      'md-icon-button': MdIconButtonProps
      'md-icon': MdBaseProps & { slot?: string }
      'md-ripple': MdBaseProps
      'md-divider': MdBaseProps & { inset?: boolean }
      'md-circular-progress': MdBaseProps & {
        value?: number
        max?: number
        indeterminate?: boolean
        'four-color'?: boolean
      }
      'md-tabs': MdBaseProps & {
        'active-tab-index'?: number
        'aria-label'?: string
      }
      'md-primary-tab': MdBaseProps & {
        'inline-icon'?: boolean
        active?: boolean
      }
      'md-chip-set': MdBaseProps
      'md-assist-chip': MdBaseProps & {
        label?: string
        disabled?: boolean
        elevated?: boolean
        href?: string
        target?: string
      }
    }
  }
}

export {}
