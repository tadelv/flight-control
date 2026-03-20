import type { StatusCheck, FlightStatus, Units, WindSpeedUnit } from '../types'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusColor: Record<FlightStatus, string> = {
  go: '#00e5ff',
  caution: '#ffaa00',
  'no-go': '#ff4444',
}

interface WeatherStripProps {
  checks: StatusCheck[]
  units: Units
  windSpeedUnit: WindSpeedUnit
}

export function WeatherStrip({ checks, units, windSpeedUnit }: WeatherStripProps) {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 px-3 mb-3">
      {checks.map((check, i) => {
        const isDistance = check.name === 'Visibility'
        const displayValue = isDistance
          ? convertDistance(check.value, units)
          : check.name === 'Precipitation'
            ? check.value
            : convertSpeed(check.value, windSpeedUnit)
        const displayUnit = isDistance
          ? distanceUnit(units)
          : check.name === 'Precipitation'
            ? '%'
            : speedUnit(windSpeedUnit)

        const color = statusColor[check.status]

        return (
          <div
            key={check.name}
            className="bg-hud-panel rounded-md py-2.5 px-1 text-center border border-hud-border"
            style={{
              animation: `fadeIn 200ms ease-out ${i * 50}ms both`,
            }}
          >
            <div className="text-[10px] tracking-[0.12em] text-hud-muted uppercase leading-none">
              {check.name === 'Precipitation' ? 'RAIN' : check.name.toUpperCase()}
            </div>
            <div
              className="text-2xl font-bold leading-tight mt-1"
              style={{ color, transition: 'color 300ms ease-out' }}
            >
              {formatValue(displayValue)}
            </div>
            <div className="text-[10px] text-hud-muted leading-none mt-0.5">{displayUnit}</div>
          </div>
        )
      })}
    </div>
  )
}
