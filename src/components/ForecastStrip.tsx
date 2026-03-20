import type { DailyForecast, Settings, FlightStatus } from '../types'
import { computeStatus } from '../utils/goNoGo'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusColor: Record<FlightStatus, string> = {
  go: '#00e5ff',
  caution: '#ffaa00',
  'no-go': '#ff4444',
}

const statusLabel: Record<FlightStatus, string> = {
  go: 'GO',
  caution: 'CAUTION',
  'no-go': 'NO-GO',
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'TODAY'
  if (date.toDateString() === tomorrow.toDateString()) return 'TOMORROW'
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

interface ForecastStripProps {
  daily: DailyForecast[]
  settings: Settings
}

export function ForecastStrip({ daily, settings }: ForecastStripProps) {
  const wsu = settings.windSpeedUnit ?? 'km/h'
  if (daily.length === 0) return null

  return (
    <div className="px-3 mb-3">
      <div className="text-[10px] tracking-[0.12em] text-hud-muted uppercase mb-1.5">3-DAY FORECAST</div>
      <div className="space-y-1.5">
        {daily.map((day) => {
          const syntheticWeather = {
            windSpeed: day.maxWindSpeed,
            windGusts: day.maxWindGusts,
            visibility: day.minVisibility,
            precipProbability: day.maxPrecipProbability,
            temperature: 0,
            weatherCode: 0,
            hourly: [],
            daily: [],
          }
          const result = computeStatus(syntheticWeather, settings, false, false)
          const color = statusColor[result.status]

          return (
            <div
              key={day.date}
              className="bg-hud-panel rounded-md border border-hud-border px-3 py-2 flex items-center justify-between"
            >
              <div className="text-xs text-hud-text font-bold tracking-wider w-20">
                {dayLabel(day.date)}
              </div>
              <div className="flex gap-3 text-[10px] text-hud-muted tracking-wider">
                <span>
                  {formatValue(convertSpeed(day.maxWindSpeed, wsu))}
                  {' '}{speedUnit(wsu)}
                </span>
                <span>
                  G{formatValue(convertSpeed(day.maxWindGusts, wsu))}
                </span>
                <span>
                  {formatValue(convertDistance(day.minVisibility, settings.units))}
                  {' '}{distanceUnit(settings.units)}
                </span>
                <span>{Math.round(day.maxPrecipProbability)}%</span>
              </div>
              <div
                className="text-[10px] font-bold tracking-wider ml-2"
                style={{ color }}
              >
                {statusLabel[result.status]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
