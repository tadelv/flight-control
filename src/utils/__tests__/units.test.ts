import { describe, it, expect } from 'vitest'
import { convertSpeed, convertDistance, formatValue } from '../units'

describe('convertSpeed', () => {
  it('returns km/h unchanged for metric', () => {
    expect(convertSpeed(25, 'metric')).toBeCloseTo(25)
  })
  it('converts km/h to mph for imperial', () => {
    expect(convertSpeed(100, 'imperial')).toBeCloseTo(62.14, 1)
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
