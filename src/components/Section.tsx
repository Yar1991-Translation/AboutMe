import type { PropsWithChildren } from 'react'
import type { ReactNode } from 'react'

type SectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: ReactNode
}>

function Section({ title, subtitle, actions, children }: SectionProps) {
  return (
    <section className="section">
      <div className="section__head">
        <div className="section__title">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="section__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export default Section

