type Tab = 'dashboard' | 'spots' | 'settings'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '◎' },
  { id: 'spots', label: 'SPOTS', icon: '★' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bg-hud-panel border-t border-hud-border grid grid-cols-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`py-3 text-center transition-colors ${
            active === tab.id ? 'text-hud-cyan' : 'text-hud-muted'
          }`}
        >
          <div className="text-base mb-0.5">{tab.icon}</div>
          <div className="text-[10px] tracking-[0.15em] uppercase">{tab.label}</div>
        </button>
      ))}
    </nav>
  )
}
