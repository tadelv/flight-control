import type { AirspaceZone } from '../types'

const RESTRICTED_TYPES = ['RESTRICTED', 'DANGER', 'PROHIBITED']
const CAUTION_TYPES = ['CTR', 'TMA', 'TMZ', 'ATZ', 'MATZ']

function zoneColor(zone: AirspaceZone): string {
  if (RESTRICTED_TYPES.includes(zone.type)) return '#ff4444'
  if (CAUTION_TYPES.includes(zone.type)) return '#ffaa00'
  return '#00dd66'
}

function zoneLabel(zone: AirspaceZone): string {
  if (RESTRICTED_TYPES.includes(zone.type)) return 'RESTRICTED'
  if (CAUTION_TYPES.includes(zone.type)) return 'CONTROLLED'
  return 'INFO'
}

interface AirspaceInfoProps {
  zones: AirspaceZone[]
}

export function AirspaceInfo({ zones }: AirspaceInfoProps) {
  if (zones.length === 0) return null

  return (
    <div className="px-3 mb-3">
      <div className="text-[10px] tracking-[0.12em] text-hud-muted uppercase mb-1.5">NEARBY AIRSPACE</div>
      <div className="space-y-1.5">
        {zones.map((zone) => {
          const color = zoneColor(zone)
          const label = zoneLabel(zone)
          return (
            <div
              key={zone.id}
              className="bg-hud-panel rounded-md border border-hud-border p-2.5 overflow-hidden"
              style={{ borderLeftWidth: 3, borderLeftColor: color }}
            >
              <div className="flex justify-between items-center">
                <div className="text-xs text-hud-text font-bold tracking-wider truncate mr-2">
                  {zone.name}
                </div>
                <div
                  className="text-[10px] font-bold tracking-wider flex-shrink-0"
                  style={{ color }}
                >
                  {label}
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-hud-muted tracking-wider">
                <span>Class {zone.class}</span>
                <span>{zone.type}</span>
                <span>{zone.lowerLimit}–{zone.upperLimit}m</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
