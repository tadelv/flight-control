import { useState } from 'react'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <div className="p-4 text-hud-cyan">Dashboard</div>}
        {activeTab === 'spots' && <div className="p-4 text-hud-cyan">Spots</div>}
        {activeTab === 'settings' && <div className="p-4 text-hud-cyan">Settings</div>}
      </div>
      <nav className="bg-hud-panel border-t border-hud-border grid grid-cols-3">
        {(['dashboard', 'spots', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-center text-[10px] tracking-widest uppercase ${
              activeTab === tab ? 'text-hud-cyan' : 'text-hud-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}
