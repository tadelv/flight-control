import { describe, it, expect } from 'vitest'
import { computeStatus } from '../goNoGo'
import { DEFAULT_SETTINGS } from '../../types'
import type { WeatherData } from '../../types'

const calm: WeatherData = {
  windSpeed: 5,
  windGusts: 8,
  visibility: 15,
  precipProbability: 0,
  temperature: 20,
  weatherCode: 0,
  hourly: [],
  daily: [],
}

describe('computeStatus', () => {
  it('returns GO when all conditions within limits', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('go')
    expect(result.reasons).toHaveLength(0)
  })

  it('returns NO-GO when wind exceeds max', () => {
    const windy = { ...calm, windSpeed: 30 }
    const result = computeStatus(windy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Wind')
  })

  it('returns NO-GO when gusts exceed max', () => {
    const gusty = { ...calm, windGusts: 40 }
    const result = computeStatus(gusty, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Gusts')
  })

  it('returns NO-GO when visibility below min', () => {
    const foggy = { ...calm, visibility: 2 }
    const result = computeStatus(foggy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Visibility')
  })

  it('returns NO-GO when precipitation exceeds max', () => {
    const rainy = { ...calm, precipProbability: 50 }
    const result = computeStatus(rainy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Precipitation')
  })

  it('returns CAUTION when value in caution zone', () => {
    const breezy = { ...calm, windSpeed: 22 }
    const result = computeStatus(breezy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('caution')
  })

  it('returns CAUTION for visibility in caution zone', () => {
    const hazy = { ...calm, visibility: 3.5 }
    const result = computeStatus(hazy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('caution')
  })

  it('returns NO-GO when in restricted airspace', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, true, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Restricted airspace')
  })

  it('returns CAUTION when in controlled airspace', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, true)
    expect(result.status).toBe('caution')
    expect(result.reasons).toContain('Controlled airspace')
  })

  it('NO-GO takes priority over CAUTION', () => {
    const bad = { ...calm, windSpeed: 30, windGusts: 10 }
    const result = computeStatus(bad, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
  })

  it('includes all check statuses in result', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, false)
    expect(result.checks).toHaveLength(4)
    expect(result.checks.map(c => c.name)).toEqual(['Wind', 'Gusts', 'Visibility', 'Precipitation'])
  })
})
