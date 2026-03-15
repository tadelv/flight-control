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
    bbox: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    limit: '100',
  })

  const res = await fetch(`https://api.core.openaip.net/api/airspaces?${params}`, {
    headers: { 'x-openaip-api-key': apiKey },
  })

  if (!res.ok) throw new Error(`Airspace API error: ${res.status}`)
  const json = await res.json()

  // OpenAIP type codes: 0=OTHER, 1=RESTRICTED, 2=DANGER, 3=PROHIBITED, 4=CTR, 5=TMZ, 6=RMZ, 7=TMA, ...
  const TYPE_MAP: Record<number, string> = {
    0: 'OTHER', 1: 'RESTRICTED', 2: 'DANGER', 3: 'PROHIBITED',
    4: 'CTR', 5: 'TMZ', 6: 'RMZ', 7: 'TMA', 8: 'TRA', 9: 'TSA',
    10: 'FIR', 11: 'UIR', 12: 'ADIZ', 13: 'ATZ', 14: 'MATZ',
    15: 'AIRWAY', 16: 'MTR', 17: 'ALERT', 18: 'WARNING', 19: 'PROTECTED',
    20: 'HTZ', 21: 'GLIDING', 22: 'TRP', 23: 'TIZ', 24: 'TIA', 25: 'MTA',
    26: 'CTA', 27: 'ACC', 28: 'SPORT', 29: 'LOW_OVERFLIGHT',
  }

  const CLASS_MAP: Record<number, string> = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G',
    7: 'SUA', 8: 'UNCLASSIFIED',
  }

  const zones: AirspaceZone[] = (json.items ?? []).map((item: Record<string, unknown>) => {
    const geom = item.geometry as Record<string, unknown> | undefined
    const coords = geom?.coordinates as [number, number][][] | undefined
    return {
      id: item._id as string,
      name: item.name as string,
      type: TYPE_MAP[item.type as number] ?? 'OTHER',
      class: CLASS_MAP[item.icaoClass as number] ?? 'UNCLASSIFIED',
      lowerLimit: ((item.lowerLimit as Record<string, number>)?.value ?? 0),
      upperLimit: ((item.upperLimit as Record<string, number>)?.value ?? 0),
      geometry: coords ?? [],
    }
  })

  return { zones, bounds }
}

const RESTRICTED_TYPES = ['RESTRICTED', 'DANGER', 'PROHIBITED']
const CAUTION_TYPES = ['CTR', 'TMA', 'TMZ', 'ATZ', 'MATZ']

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
