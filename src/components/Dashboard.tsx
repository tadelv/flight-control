import { GoNoGoHero } from './GoNoGoHero'
import { WeatherStrip } from './WeatherStrip'
import { Map } from './Map'
import { computeStatus } from '../utils/goNoGo'
import { useWeather } from '../hooks/useWeather'
import { useAirspace } from '../hooks/useAirspace'
import { useLocation } from '../hooks/useLocation'
import { useStorage } from '../hooks/useStorage'
import type { Settings, Spot, GoNoGoResult } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const defaultResult: GoNoGoResult = {
  status: 'go',
  checks: [],
  reasons: [],
}

export function Dashboard() {
  const [settings] = useStorage<Settings>('fc-settings', DEFAULT_SETTINGS)
  const [spots] = useStorage<Spot[]>('fc-spots', [])
  const location = useLocation()
  const weather = useWeather(location.coordinates)
  const airspace = useAirspace(location.coordinates)

  const result = weather.data
    ? computeStatus(weather.data, settings, airspace.inRestricted, airspace.inCaution)
    : defaultResult

  const loading = location.loading || weather.loading

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hud-panel px-4 py-3 flex justify-between items-center border-b border-hud-border">
        <div className="text-sm font-bold text-hud-cyan tracking-[0.15em]">
          <span className="opacity-50 mr-1">⬡</span> FLIGHT CONTROL
        </div>
        <button
          onClick={weather.refresh}
          className="text-xs text-hud-muted hover:text-hud-cyan active:scale-95 transition-all duration-150 tracking-wider px-2 py-1 -mr-2 rounded"
          aria-label="Refresh weather data"
        >
          ↻ REFRESH
        </button>
      </div>

      {weather.stale && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-amber/10 border border-hud-amber/25 rounded text-xs text-hud-amber tracking-wider">
          SHOWING CACHED DATA • {weather.error}
        </div>
      )}

      {location.error && !location.coordinates && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-red/10 border border-hud-red/25 rounded text-xs text-hud-red tracking-wider">
          {location.error}
        </div>
      )}

      <GoNoGoHero
        status={result.status}
        reasons={result.reasons}
        loading={loading}
      />

      {weather.data && (
        <div className="mt-3">
          <WeatherStrip checks={result.checks} units={settings.units} />
        </div>
      )}

      {location.coordinates && (
        <Map
          coordinates={location.coordinates}
          airspaceZones={airspace.zones}
          spots={spots}
          onMapClick={location.setManualLocation}
        />
      )}
    </div>
  )
}
