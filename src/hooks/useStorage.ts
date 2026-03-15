import { useState, useCallback } from 'react'

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // localStorage full or unavailable — value still updates in memory
        }
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
