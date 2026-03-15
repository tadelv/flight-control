import type { Units } from '../types'

const KM_TO_MI = 0.621371

export function convertSpeed(kmh: number, units: Units): number {
  return units === 'imperial' ? kmh * KM_TO_MI : kmh
}

export function convertDistance(km: number, units: Units): number {
  return units === 'imperial' ? km * KM_TO_MI : km
}

export function speedUnit(units: Units): string {
  return units === 'imperial' ? 'mph' : 'km/h'
}

export function distanceUnit(units: Units): string {
  return units === 'imperial' ? 'mi' : 'km'
}

export function formatValue(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}
