import Icon from './Icon'

export type RailPageId = 'home' | 'games' | 'repos' | 'contact'

type RailItem = {
  id: RailPageId
  label: string
  icon: string
}

export const railItems: RailItem[] = [
  { id: 'home', label: '主页', icon: 'home' },
  { id: 'games', label: '游戏', icon: 'sports_esports' },
  { id: 'repos', label: '仓库', icon: 'folder' },
  { id: 'contact', label: '联系', icon: 'contact_mail' },
]

type NavigationRailProps = {
  active: RailPageId
  onChange: (id: RailPageId) => void
}

function NavigationRail({ active, onChange }: NavigationRailProps) {
  return (
    <aside className="nav-rail" aria-label="主导航">
      <div className="nav-rail__items">
        {railItems.map((it) => (
          <mdui-button
            key={it.id}
            variant={active === it.id ? 'tonal' : 'text'}
            className={`nav-rail__item ${active === it.id ? 'is-active' : ''}`}
            onClick={() => onChange(it.id)}
            aria-current={active === it.id ? 'page' : undefined}
          >
            <Icon name={it.icon} slot="icon" />
            {it.label}
          </mdui-button>
        ))}
      </div>
    </aside>
  )
}

export default NavigationRail



