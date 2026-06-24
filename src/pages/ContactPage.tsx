import Section from '../components/Section'
import ContactBar from '../components/ContactBar'
import SeasonPicker from '../components/SeasonPicker'
import { content } from '../content'
import type { SeasonPreference } from '../theme/season'

type ContactPageProps = {
  seasonPreference: SeasonPreference
  onSeasonChange: (value: SeasonPreference) => void
}

function ContactPage({ seasonPreference, onSeasonChange }: ContactPageProps) {
  const contactIntro =
    content.tabs.find((t) => t.id === 'contact')?.intro ??
    '想聊就聊，想合作就合作，想一起玩也行（我不咬人，大概率）。'

  return (
    <>
      <Section title="联系我" subtitle={contactIntro}>
        <ContactBar contacts={content.contacts} />
        <p style={{ margin: 0, color: 'rgb(var(--mdui-color-on-surface-variant))', lineHeight: 1.7 }}>
          小提示：我可能会慢回，但不会装死；如果你发的是"救命"级别的事，那我就当场上线。
        </p>
      </Section>

      <Section title="季节配色" subtitle="不申请定位权限：默认按时区推个半球，再按月份映射春夏秋冬；也可以手动锁定。">
        <SeasonPicker value={seasonPreference} onChange={onSeasonChange} />
      </Section>
    </>
  )
}

export default ContactPage
