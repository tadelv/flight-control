import { useState, useEffect, useCallback } from 'react'
import type { Coordinates, AirspaceZone } from '../types'

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const CACHE_KEY = 'fc-airspace-cache'
const BBOX_RADIUS = 0.25 // ~25km at mid-latitudes

interface AirspaceCache {
  data: AirspaceZone[]
  timestamp: number
  bounds: { north: number; south: number; east: number; west: number }
}

function getCached(): AirspaceCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw) as AirspaceCache
    if (Date.now() - cache.timestamp > CACHE_TTL) return null
    return cache
  } catch {
    return null
  }
}

function isWithinBounds(coords: Coordinates, bounds: AirspaceCache['bounds']): boolean {
  return (
    coords.lat >= bounds.south &&
    coords.lat <= bounds.north &&
    coords.lng >= bounds.west &&
    coords.lng <= bounds.east
  )
}

function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

async function fetchAirspace(lat: number, lng: number): Promise<{ zones: AirspaceZone[]; bounds: AirspaceCache['bounds'] }> {
  const apiKey = import.meta.env.VITE_OPENAIP_API_KEY
  if (!apiKey) {
    return { zones: [], bounds: { north: lat + BBOX_RADIUS, south: lat - BBOX_RADIUS, east: lng + BBOX_RADIUS, west: lng - BBOX_RADIUS } }
  }

  const bounds = {
    north: lat + BBOX_RADIUS,
    south: lat - BBOX_RADIUS,
    east: lng + BBOX_RADIUS,
    west: lng - BBOX_RADIUS,
  }

  const params = new URLSearchParams({
    pos: `${lng},${lat}`,
    dist: '25000',
    limit: '100',
  })

  const res = await fetch(`https://api.core.openaip.net/api/airspaces?${params}`, {
    headers: { 'x-openaip-api-key': apiKey },
  })

  if (!res.ok) throw new Error(`Airspace API error: ${res.status}`)
  const json = await res.json()

  const zones: AirspaceZone[] = (json.items ?? []).map((item: Record<string, unknown>) => ({
    id: item._id as string,
    name: item.name as string,
    type: item.type as string,
    class: (item.icaoClass as string) ?? 'UNKNOWN',
    lowerLimit: ((item.lowerLimit as Record<string, number>)?.value ?? 0),
    upperLimit: ((item.upperLimit as Record<string, number>)?.value ?? 0),
    geometry: (item.geometry as Record<string, unknown>)?.coordinates as [number, number][][],
  }))

  return { zones, bounds }
}

const RESTRICTED_TYPES = ['RESTRICTED', 'DANGER', 'PROHIBITED']
const CAUTION_TYPES = ['CTR', 'TMA']

interface AirspaceState {
  zones: AirspaceZone[]
  loading: boolean
  error: string | null
  inRestricted: boolean
  inCaution: boolean
}

export function useAirspace(coordinates: Coordinates | null) {
  const [state, setState] = useState<AirspaceState>({
    zones: [],
    loading: false,
    error: null,
    inRestricted: false,
    inCaution: false,
  })

  const checkAirspace = useCallback((zones: AirspaceZone[], coords: Coordinates) => {
    const point: [number, number] = [coords.lng, coords.lat]
    const isInZone = (types: string[]) =>
      zones.some((zone) => {
        if (!types.includes(zone.type)) return false
        if (!zone.geometry?.[0]) return false
        return pointInPolygon(point, zone.geometry[0])
      })
    return {
      inRestricted: isInZone(RESTRICTED_TYPES),
      inCaution: isInZone(CAUTION_TYPES),
    }
  }, [])

  const load = useCallback(async (coords: Coordinates) => {
    const cached = getCached()
    if (cached && isWithinBounds(coords, cached.bounds)) {
      const { inRestricted, inCaution } = checkAirspace(cached.data, coords)
      setState({ zones: cached.data, loading: false, error: null, inRestricted, inCaution })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { zones, bounds } = await fetchAirspace(coords.lat, coords.lng)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: zones, timestamp: Date.now(), bounds }))
      const { inRestricted, inCaution } = checkAirspace(zones, coords)
      setState({ zones, loading: false, error: null, inRestricted, inCaution })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch airspace data',
      }))
    }
  }, [checkAirspace])

  useEffect(() => {
    if (coordinates) load(coordinates)
  }, [coordinates, load])

  return state
}
