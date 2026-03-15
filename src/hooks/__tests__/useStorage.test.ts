import { renderHook, act } from '@testing-library/react'
import { useStorage } from '../useStorage'
import { describe, it, expect, beforeEach } from 'vitest'

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default value when storage is empty', () => {
    const { result } = renderHook(() => useStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useStorage('test-key', 'default'))
    act(() => {
      result.current[1]('updated')
    })
    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated')
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing'))
    const { result } = renderHook(() => useStorage('test-key', 'default'))
    expect(result.current[0]).toBe('existing')
  })

  it('works with objects', () => {
    const defaultVal = { a: 1, b: 2 }
    const { result } = renderHook(() => useStorage('test-key', defaultVal))
    expect(result.current[0]).toEqual(defaultVal)
    act(() => {
      result.current[1]({ a: 10, b: 20 })
    })
    expect(result.current[0]).toEqual({ a: 10, b: 20 })
  })
})
