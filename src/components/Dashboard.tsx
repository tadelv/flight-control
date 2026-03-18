import { GoNoGoHero } from './GoNoGoHero'
import { WeatherStrip } from './WeatherStrip'
import { AirspaceInfo } from './AirspaceInfo'
import { ForecastStrip } from './ForecastStrip'
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
      {/* Header */}
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

      {/* Banners */}
      {weather.stale && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-amber/10 border border-hud-amber/25 rounded text-xs text-hud-amber tracking-wider">
          WEATHER DATA MAY BE OUTDATED • {weather.error}
        </div>
      )}
      {location.error && !location.coordinates && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-red/10 border border-hud-red/25 rounded text-xs text-hud-red tracking-wider">
          {location.error}
        </div>
      )}

      {/* Desktop: side-by-side / Mobile: stacked */}
      <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
        {/* Left panel: status + weather */}
        <div className="md:w-80 lg:w-96 md:flex-shrink-0 md:overflow-auto md:border-r md:border-hud-border">
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

          {weather.data && weather.data.daily.length > 0 && (
            <ForecastStrip daily={weather.data.daily} settings={settings} />
          )}

          <div className="hidden md:block">
            <AirspaceInfo zones={airspace.zones} />
          </div>
        </div>

        {/* Right panel: map (expands on desktop) */}
        {location.coordinates && (
          <div className="flex-1 flex flex-col min-h-[250px] md:min-h-0">
            <Map
              coordinates={location.coordinates}
              airspaceZones={airspace.zones}
              spots={spots}
              onMapClick={location.setManualLocation}
            />
          </div>
        )}

        {/* Mobile only: airspace info below map */}
        <div className="md:hidden">
          <AirspaceInfo zones={airspace.zones} />
        </div>
      </div>
    </div>
  )
}
