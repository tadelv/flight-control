import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'spots' && <div className="p-4 text-hud-cyan">Spots</div>}
        {activeTab === 'settings' && <div className="p-4 text-hud-cyan">Settings</div>}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
