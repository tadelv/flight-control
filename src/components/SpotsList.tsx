import { useState } from 'react'
import { SpotCard } from './SpotCard'
import { SpotEditor } from './SpotEditor'
import { useStorage } from '../hooks/useStorage'
import { useWeather } from '../hooks/useWeather'
import { computeStatus } from '../utils/goNoGo'
import type { Spot, Settings, Coordinates } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface SpotsListProps {
  currentLocation: Coordinates | null
  onNavigateToSpot: (coords: Coordinates) => void
}

export function SpotsList({ currentLocation, onNavigateToSpot }: SpotsListProps) {
  const [spots, setSpots] = useStorage<Spot[]>('fc-spots', [])
  const [settings] = useStorage<Settings>('fc-settings', DEFAULT_SETTINGS)
  const [editing, setEditing] = useState<Spot | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleSave = (data: Omit<Spot, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      setSpots((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)),
      )
    } else {
      const newSpot: Spot = {
        id: crypto.randomUUID(),
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      }
      setSpots((prev) => [...prev, newSpot])
    }
    setShowEditor(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setShowEditor(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hud-panel px-4 py-2.5 flex justify-between items-center border-b border-hud-border">
        <div className="text-sm tracking-[0.15em] text-hud-cyan">SAVED SPOTS</div>
        <button
          onClick={() => { setEditing(null); setShowEditor(true) }}
          className="text-xs text-hud-cyan border border-hud-cyan/30 px-2.5 py-1 rounded tracking-wider hover:bg-hud-cyan/10 transition-colors"
        >
          + ADD
        </button>
      </div>

      <div className="flex-1 overflow-auto pt-2">
        {spots.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-8">
            <div>
              <div className="text-hud-muted/50 text-2xl mb-2">★</div>
              <div className="text-xs text-hud-muted/50 tracking-wider leading-relaxed">
                No spots saved yet.<br />
                Add your favorite flying locations to check conditions quickly.
              </div>
            </div>
          </div>
        ) : (
          spots.map((spot) => (
            <SpotCardWithWeather
              key={spot.id}
              spot={spot}
              settings={settings}
              onTap={() => onNavigateToSpot({ lat: spot.lat, lng: spot.lng })}
              onLongPress={() => { setEditing(spot); setShowEditor(true) }}
            />
          ))
        )}
      </div>

      {showEditor && (
        <SpotEditor
          spot={editing ?? undefined}
          currentLocation={currentLocation}
          onSave={handleSave}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
          onCancel={() => { setShowEditor(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function SpotCardWithWeather({
  spot,
  settings,
  onTap,
  onLongPress,
}: {
  spot: Spot
  settings: Settings
  onTap: () => void
  onLongPress: () => void
}) {
  const weather = useWeather({ lat: spot.lat, lng: spot.lng })
  const status = weather.data
    ? computeStatus(weather.data, settings, false, false).status
    : 'go'

  return (
    <SpotCard
      spot={spot}
      status={status}
      windSpeed={weather.data?.windSpeed}
      windGusts={weather.data?.windGusts}
      visibility={weather.data?.visibility}
      units={settings.units}
      windSpeedUnit={settings.windSpeedUnit ?? 'km/h'}
      onTap={onTap}
      onLongPress={onLongPress}
    />
  )
}
