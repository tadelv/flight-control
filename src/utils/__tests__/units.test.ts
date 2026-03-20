import { describe, it, expect } from 'vitest'
import { convertSpeed, convertDistance, formatValue } from '../units'

describe('convertSpeed', () => {
  it('returns km/h unchanged for km/h', () => {
    expect(convertSpeed(25, 'km/h')).toBeCloseTo(25)
  })
  it('converts km/h to m/s', () => {
    expect(convertSpeed(36, 'm/s')).toBeCloseTo(10)
  })
  it('converts km/h to knots', () => {
    expect(convertSpeed(100, 'kts')).toBeCloseTo(53.9957, 1)
  })
})

describe('convertDistance', () => {
  it('returns km unchanged for metric', () => {
    expect(convertDistance(10, 'metric')).toBeCloseTo(10)
  })
  it('converts km to miles for imperial', () => {
    expect(convertDistance(10, 'imperial')).toBeCloseTo(6.21, 1)
  })
})

describe('formatValue', () => {
  it('formats with one decimal', () => {
    expect(formatValue(12.345)).toBe('12.3')
  })
  it('formats whole numbers without decimal', () => {
    expect(formatValue(12.0)).toBe('12')
  })
})
