/// <reference types="react" />

type BaseProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mdui-button': BaseProps & {
        variant?: 'tonal' | 'filled' | 'outlined' | 'text' | 'elevated'
        icon?: string
        href?: string
        target?: string
        rel?: string
      }
      'mdui-card': BaseProps & {
        variant?: 'elevated' | 'filled' | 'outlined'
      }
      'mdui-chip': BaseProps & { icon?: string; label?: string; variant?: string }
      'mdui-icon': BaseProps & { name?: string }
      'mdui-button-icon': BaseProps & {
        variant?: 'standard' | 'filled' | 'tonal' | 'outlined'
        icon?: string
        'selected-icon'?: string
        selectable?: boolean
        selected?: boolean
        href?: string
        target?: '_blank' | '_parent' | '_self' | '_top'
        rel?: string
      }
      'mdui-layout': BaseProps
      'mdui-layout-main': BaseProps
      'mdui-top-app-bar': BaseProps & {
        variant?: 'small' | 'medium' | 'large'
        'scroll-target'?: string | HTMLElement
        order?: number
      }
      'mdui-top-app-bar-title': BaseProps
      'mdui-tabs': BaseProps & {
        value?: string
        variant?: 'primary' | 'secondary'
        scrollable?: boolean
        onChange?: (event: Event) => void
      }
      'mdui-tab': BaseProps & {
        value?: string
        icon?: string
      }
      'mdui-tab-panel': BaseProps & {
        value?: string
      }
      'mdui-switch': BaseProps & { checked?: boolean; disabled?: boolean }
    }
  }
}

export {}

