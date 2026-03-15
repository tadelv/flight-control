import { useState, useCallback } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import { SpotsList } from './components/SpotsList'
import { Settings } from './components/Settings'
import { useLocation } from './hooks/useLocation'
import type { Coordinates } from './types'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const location = useLocation()

  const handleNavigateToSpot = useCallback((coords: Coordinates) => {
    location.setManualLocation(coords)
    setActiveTab('dashboard')
  }, [location])

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto" role="tabpanel">
        <div key={activeTab} className="tab-content h-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'spots' && (
            <SpotsList
              currentLocation={location.coordinates}
              onNavigateToSpot={handleNavigateToSpot}
            />
          )}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <div className="scanline-overlay" aria-hidden="true" />
    </div>
  )
}
