import { useRef } from 'react'
import type { Spot, FlightStatus, Units, WindSpeedUnit } from '../types'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusLabel: Record<FlightStatus, { text: string; color: string }> = {
  go: { text: 'GO', color: '#00ff66' },
  caution: { text: 'CAUTION', color: '#ffaa00' },
  'no-go': { text: 'NO-GO', color: '#ff4444' },
}

interface SpotCardProps {
  spot: Spot
  status: FlightStatus
  windSpeed?: number
  windGusts?: number
  visibility?: number
  units: Units
  windSpeedUnit: WindSpeedUnit
  onTap: () => void
  onLongPress: () => void
}

export function SpotCard({ spot, status, windSpeed, windGusts, visibility, units, windSpeedUnit, onTap, onLongPress }: SpotCardProps) {
  const label = statusLabel[status]
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress()
      longPressTimer.current = null
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
      onTap()
    }
  }

  return (
    <div
      className="mx-3 mb-2 bg-hud-panel rounded-md border border-hud-border p-3 cursor-pointer active:scale-[0.98] hover:border-hud-muted/40 transition-all duration-150 overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: label.color }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-sm text-hud-text font-bold tracking-wider">{spot.name}</div>
        <div
          className="text-xs font-bold tracking-wider"
          style={{ color: label.color }}
        >
          {label.text}
        </div>
      </div>
      <div className="text-xs text-hud-muted tracking-wide mb-1.5">
        {spot.lat.toFixed(4)}° N, {spot.lng.toFixed(4)}° E
      </div>
      {spot.notes && (
        <div className="text-xs text-hud-muted/70 leading-relaxed mb-2">{spot.notes}</div>
      )}
      {windSpeed !== undefined && (
        <div className="flex gap-3 text-[11px] text-hud-muted tracking-wider pt-1.5 border-t border-hud-border/50">
          <span>WIND {formatValue(convertSpeed(windSpeed, windSpeedUnit))} {speedUnit(windSpeedUnit)}</span>
          {windGusts !== undefined && (
            <span>GUST {formatValue(convertSpeed(windGusts, windSpeedUnit))} {speedUnit(windSpeedUnit)}</span>
          )}
          {visibility !== undefined && (
            <span>VIS {formatValue(convertDistance(visibility, units))} {distanceUnit(units)}</span>
          )}
        </div>
      )}
    </div>
  )
}
