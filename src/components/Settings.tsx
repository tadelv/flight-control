import { ThresholdSlider } from './ThresholdSlider'
import { useStorage } from '../hooks/useStorage'
import type { Settings as SettingsType, Units } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { speedUnit, distanceUnit } from '../utils/units'

export function Settings() {
  const [settings, setSettings] = useStorage<SettingsType>('fc-settings', DEFAULT_SETTINGS)

  const update = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const su = speedUnit(settings.units)
  const du = distanceUnit(settings.units)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hud-panel px-4 py-2.5 border-b border-hud-border">
        <div className="text-sm tracking-[0.15em] text-hud-cyan">SETTINGS</div>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="md:max-w-2xl md:mx-auto">
        <div className="mb-4">
          <div className="text-[11px] tracking-[0.15em] text-hud-muted mb-2">UNITS</div>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as Units[]).map((u) => (
              <button
                key={u}
                onClick={() => update('units', u)}
                className={`flex-1 py-2 text-xs tracking-wider rounded border transition-colors ${
                  settings.units === u
                    ? 'border-hud-cyan bg-hud-cyan/10 text-hud-cyan'
                    : 'border-hud-border text-hud-muted'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[11px] tracking-[0.15em] text-hud-muted mb-2">GO/NO-GO THRESHOLDS</div>
          <div className="md:grid md:grid-cols-2 md:gap-x-3">
            <ThresholdSlider label="MAX WIND" description="Sustained wind speed limit" value={settings.maxWind} min={5} max={60} step={1} unit={su} onChange={(v) => update('maxWind', v)} />
            <ThresholdSlider label="MAX GUST" description="Wind gust limit" value={settings.maxGust} min={10} max={80} step={1} unit={su} onChange={(v) => update('maxGust', v)} />
            <ThresholdSlider label="MIN VISIBILITY" description="Minimum acceptable visibility" value={settings.minVisibility} min={0.5} max={20} step={0.5} unit={du} onChange={(v) => update('minVisibility', v)} />
            <ThresholdSlider label="MAX PRECIPITATION" description="Rain probability limit" value={settings.maxPrecip} min={0} max={100} step={5} unit="%" onChange={(v) => update('maxPrecip', v)} />
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[11px] tracking-[0.15em] text-hud-muted mb-2">CAUTION ZONE</div>
          <div className="bg-hud-panel rounded-md border border-hud-border p-3">
            <div className="text-xs text-hud-muted/70 leading-relaxed mb-2">
              CAUTION triggers when any value is within this percentage of your limit.
            </div>
            <div className="flex gap-2">
              {[0.7, 0.8, 0.9].map((z) => (
                <button
                  key={z}
                  onClick={() => update('cautionZone', z)}
                  className={`flex-1 py-1.5 text-xs tracking-wider rounded border transition-colors ${
                    settings.cautionZone === z
                      ? 'border-hud-amber bg-hud-amber/10 text-hud-amber'
                      : 'border-hud-border text-hud-muted'
                  }`}
                >
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
