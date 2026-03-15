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
    <nav className="bg-hud-panel border-t border-hud-border grid grid-cols-3" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="relative py-4 text-center transition-colors duration-200 min-h-[56px]"
            style={{ color: isActive ? '#00e5ff' : '#5a7a9a' }}
          >
            {/* Active indicator bar */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full transition-all duration-300"
              style={{
                width: isActive ? 24 : 0,
                backgroundColor: '#00e5ff',
                boxShadow: isActive ? '0 0 8px rgba(0, 229, 255, 0.5)' : 'none',
                opacity: isActive ? 1 : 0,
              }}
            />
            <div className="text-base mb-0.5">{tab.icon}</div>
            <div className="text-[11px] tracking-[0.12em]">{tab.label}</div>
          </button>
        )
      })}
    </nav>
  )
}
