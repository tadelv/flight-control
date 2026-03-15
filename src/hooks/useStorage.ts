import { useState, useCallback, useEffect } from 'react'

// Custom event for cross-component sync when the same key is used in multiple hooks
const STORAGE_EVENT = 'fc-storage-sync'

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  // Listen for changes from other hook instances using the same key
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail.key === key) {
        setStoredValue(detail.value as T)
      }
    }
    window.addEventListener(STORAGE_EVENT, handler)
    return () => window.removeEventListener(STORAGE_EVENT, handler)
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // localStorage full or unavailable — value still updates in memory
        }
        // Notify other hook instances
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key, value: nextValue } }))
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
