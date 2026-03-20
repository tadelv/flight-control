import type { Units, WindSpeedUnit } from '../types'

const KM_TO_MI = 0.621371
const KMH_TO_MS = 1 / 3.6
const KMH_TO_KTS = 0.539957

export function convertSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'm/s': return kmh * KMH_TO_MS
    case 'kts': return kmh * KMH_TO_KTS
    default: return kmh
  }
}

export function convertDistance(km: number, units: Units): number {
  return units === 'imperial' ? km * KM_TO_MI : km
}

export function speedUnit(unit: WindSpeedUnit): string {
  return unit
}

export function distanceUnit(units: Units): string {
  return units === 'imperial' ? 'mi' : 'km'
}

export function formatValue(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}
