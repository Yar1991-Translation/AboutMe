import { railItems, type RailPageId } from './NavigationRail'
import Icon from './Icon'

type BottomNavigationProps = {
  active: RailPageId
  onChange: (id: RailPageId) => void
}

function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="底部导航">
      {railItems.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`bottom-nav__item ${active === it.id ? 'is-active' : ''}`}
          onClick={() => onChange(it.id)}
          aria-current={active === it.id ? 'page' : undefined}
        >
          <Icon name={it.icon} />
          <span className="bottom-nav__label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNavigation
