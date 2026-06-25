import Icon from './Icon'

export type RailPageId = 'home' | 'games' | 'repos' | 'contact'

type RailItem = {
  id: RailPageId
  label: string
  icon: string
  path: string
}

export const railItems: RailItem[] = [
  { id: 'home', label: '主页', icon: 'home', path: '/' },
  { id: 'games', label: '游戏', icon: 'sports_esports', path: '/games' },
  { id: 'repos', label: '仓库', icon: 'folder', path: '/repos' },
  { id: 'contact', label: '联系', icon: 'contact_mail', path: '/contact' },
]

export const railIdToPath = (id: RailPageId): string =>
  railItems.find((it) => it.id === id)?.path ?? '/'

export const pathToRailId = (pathname: string): RailPageId => {
  const match = railItems.find((it) => it.path === pathname)
  return match?.id ?? 'home'
}

type NavigationRailProps = {
  active: RailPageId
  onChange: (id: RailPageId) => void
}

function NavigationRail({ active, onChange }: NavigationRailProps) {
  return (
    <aside className="nav-rail" aria-label="主导航">
      <div className="nav-rail__items">
        {railItems.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`nav-rail__item ${active === it.id ? 'is-active' : ''}`}
            onClick={() => onChange(it.id)}
            aria-current={active === it.id ? 'page' : undefined}
          >
            <Icon name={it.icon} />
            {it.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default NavigationRail
