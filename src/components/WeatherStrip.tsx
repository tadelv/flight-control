import type { StatusCheck, FlightStatus, Units } from '../types'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusColor: Record<FlightStatus, string> = {
  go: 'text-hud-cyan',
  caution: 'text-hud-amber',
  'no-go': 'text-hud-red',
}

interface WeatherStripProps {
  checks: StatusCheck[]
  units: Units
}

export function WeatherStrip({ checks, units }: WeatherStripProps) {
  return (
    <div className="grid grid-cols-4 gap-2 px-3 mb-3">
      {checks.map((check) => {
        const isDistance = check.name === 'Visibility'
        const displayValue = isDistance
          ? convertDistance(check.value, units)
          : check.name === 'Precipitation'
            ? check.value
            : convertSpeed(check.value, units)
        const displayUnit = isDistance
          ? distanceUnit(units)
          : check.name === 'Precipitation'
            ? '%'
            : speedUnit(units)

        return (
          <div
            key={check.name}
            className="bg-hud-panel rounded-md p-2 text-center border border-hud-border"
          >
            <div className="text-[9px] tracking-[0.1em] text-hud-muted uppercase">
              {check.name}
            </div>
            <div className={`text-lg font-bold ${statusColor[check.status]}`}>
              {formatValue(displayValue)}
            </div>
            <div className="text-[9px] text-hud-muted">{displayUnit}</div>
          </div>
        )
      })}
    </div>
  )
}
