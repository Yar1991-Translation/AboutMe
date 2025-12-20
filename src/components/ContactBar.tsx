import type { ContactType } from '../content'
import Icon from './Icon'
import SvgIcon from './SvgIcon'

type ContactBarProps = {
  contacts: { label: string; href: string; type: ContactType }[]
  variant?: 'tonal' | 'filled' | 'outlined' | 'text' | 'elevated'
}

const iconName: Record<ContactType, string> = {
  email: 'mail',
  github: 'code',
  bilibili: 'smart_display',
  qq: 'chat',
  youtube: 'play_circle',
}

const svgFile: Partial<Record<ContactType, string>> = {
  github: 'github.svg',
  bilibili: 'bilibili.svg',
  youtube: 'youtube.svg',
  qq: 'qq.svg',
  email: 'mail.svg',
}

function ContactBar({ contacts, variant = 'outlined' }: ContactBarProps) {
  return (
    <div className="contact-bar">
      {contacts.map((item) => (
        <mdui-button
          key={item.label}
          variant={variant}
          href={item.href}
          target="_blank"
          rel="noreferrer"
        >
          {svgFile[item.type] ? (
            <SvgIcon file={svgFile[item.type]!} slot="icon" />
          ) : (
            <Icon name={iconName[item.type]} slot="icon" />
          )}
          {item.label}
        </mdui-button>
      ))}
    </div>
  )
}

export default ContactBar

