import { useState, useEffect, useCallback } from 'react'
import type { Coordinates } from '../types'
import { useStorage } from './useStorage'

interface LocationState {
  coordinates: Coordinates | null
  error: string | null
  loading: boolean
}

export function useLocation() {
  const [lastLocation, setLastLocation] = useStorage<Coordinates | null>('fc-last-location', null)
  const [state, setState] = useState<LocationState>({
    coordinates: lastLocation,
    error: null,
    loading: true,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setState({ coordinates: coords, error: null, loading: false })
        setLastLocation(coords)
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.code === 1
            ? 'Location permission denied. Tap the map to select a location manually.'
            : 'Unable to get location. Using last known position.',
        }))
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [setLastLocation])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const setManualLocation = useCallback(
    (coords: Coordinates) => {
      setState({ coordinates: coords, error: null, loading: false })
      setLastLocation(coords)
    },
    [setLastLocation],
  )

  return { ...state, requestLocation, setManualLocation }
}
