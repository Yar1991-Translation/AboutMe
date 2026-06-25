import type { ContactType } from '../content'
import Icon from './Icon'
import SvgIcon from './SvgIcon'
import Button from '@/primitives/Button'
import type { ButtonVariant } from '@/primitives/Button'
import styles from './ContactBar.module.css'

type ContactBarProps = {
  contacts: { label: string; href: string; type: ContactType }[]
  variant?: ButtonVariant
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

export default function ContactBar({ contacts, variant = 'outlined' }: ContactBarProps) {
  return (
    <div className={styles.bar}>
      {contacts.map((item) => (
        <Button key={item.label} variant={variant} href={item.href} target="_blank" rel="noreferrer">
          {svgFile[item.type] ? (
            <SvgIcon file={svgFile[item.type]!} />
          ) : (
            <Icon name={iconName[item.type]} />
          )}
          {item.label}
        </Button>
      ))}
    </div>
  )
}
