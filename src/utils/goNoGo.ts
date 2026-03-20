import type { WeatherData, Settings, GoNoGoResult, StatusCheck, FlightStatus } from '../types'

function checkNormal(name: string, value: number, limit: number, unit: string, cautionZone: number): StatusCheck {
  let status: FlightStatus = 'go'
  if (value > limit) status = 'no-go'
  else if (value > limit * cautionZone) status = 'caution'
  return { name, value, limit, unit, status }
}

function checkVisibility(value: number, limit: number, unit: string, cautionZone: number): StatusCheck {
  let status: FlightStatus = 'go'
  if (value < limit) status = 'no-go'
  else if (value < limit / cautionZone) status = 'caution'
  return { name: 'Visibility', value, limit, unit, status }
}

export function computeStatus(
  weather: WeatherData,
  settings: Settings,
  inRestrictedAirspace: boolean,
  inCautionAirspace: boolean,
): GoNoGoResult {
  const wsu = settings.windSpeedUnit ?? 'km/h'
  const checks: StatusCheck[] = [
    checkNormal('Wind', weather.windSpeed, settings.maxWind, wsu, settings.cautionZone),
    checkNormal('Gusts', weather.windGusts, settings.maxGust, wsu, settings.cautionZone),
    checkVisibility(weather.visibility, settings.minVisibility, 'km', settings.cautionZone),
    checkNormal('Precipitation', weather.precipProbability, settings.maxPrecip, '%', settings.cautionZone),
  ]

  const reasons: string[] = []
  const cautionReasons: string[] = []

  if (inRestrictedAirspace) {
    reasons.push('Restricted airspace')
  }

  if (inCautionAirspace) {
    cautionReasons.push('Controlled airspace')
  }

  for (const check of checks) {
    if (check.status === 'no-go') {
      reasons.push(check.name)
    }
  }

  if (reasons.length > 0) {
    return { status: 'no-go', checks, reasons }
  }

  const hasCaution = checks.some((c) => c.status === 'caution') || cautionReasons.length > 0
  if (hasCaution) {
    return { status: 'caution', checks, reasons: cautionReasons }
  }

  return { status: 'go', checks, reasons: [] }
}
