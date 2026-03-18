import { useState, useEffect, useCallback } from 'react'
import type { Coordinates, WeatherData, HourlyForecast, DailyForecast } from '../types'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const CACHE_KEY = 'fc-weather-cache'

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`
}

function getCached(lat: number, lng: number): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw) as Record<string, { data: WeatherData; timestamp: number }>
    const entry = cache[coordKey(lat, lng)]
    if (!entry) return null
    if (Date.now() - entry.timestamp > CACHE_TTL) return null
    return entry.data
  } catch {
    return null
  }
}

function setCache(lat: number, lng: number, data: WeatherData) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const cache = raw ? JSON.parse(raw) : {}
    cache[coordKey(lat, lng)] = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full
  }
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'wind_speed_10m,wind_gusts_10m,visibility,precipitation_probability,temperature_2m,weather_code',
    hourly: 'wind_speed_10m,wind_gusts_10m,precipitation_probability',
    forecast_hours: '12',
    daily: 'wind_speed_10m_max,wind_gusts_10m_max,visibility_min,precipitation_probability_max',
    forecast_days: '3',
    wind_speed_unit: 'kmh',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const json = await res.json()

  const hourly: HourlyForecast[] = (json.hourly?.time ?? []).map((time: string, i: number) => ({
    time,
    windSpeed: json.hourly.wind_speed_10m[i],
    windGusts: json.hourly.wind_gusts_10m[i],
    precipProbability: json.hourly.precipitation_probability[i],
  }))

  const daily: DailyForecast[] = (json.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    maxWindSpeed: json.daily.wind_speed_10m_max[i],
    maxWindGusts: json.daily.wind_gusts_10m_max[i],
    minVisibility: (json.daily.visibility_min[i] ?? 100000) / 1000,
    maxPrecipProbability: json.daily.precipitation_probability_max[i],
  }))

  return {
    windSpeed: json.current.wind_speed_10m,
    windGusts: json.current.wind_gusts_10m,
    visibility: json.current.visibility / 1000, // API returns meters, we use km
    precipProbability: json.current.precipitation_probability,
    temperature: json.current.temperature_2m,
    weatherCode: json.current.weather_code,
    hourly,
    daily,
  }
}

interface WeatherState {
  data: WeatherData | null
  loading: boolean
  error: string | null
  stale: boolean
}

export function useWeather(coordinates: Coordinates | null) {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
    stale: false,
  })

  const load = useCallback(async (coords: Coordinates, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCached(coords.lat, coords.lng)
      if (cached) {
        setState({ data: cached, loading: false, error: null, stale: false })
        return
      }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetchWeather(coords.lat, coords.lng)
      setCache(coords.lat, coords.lng, data)
      setState({ data, loading: false, error: null, stale: false })
    } catch (err) {
      const cached = getCached(coords.lat, coords.lng)
      setState({
        data: cached,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch weather',
        stale: cached !== null,
      })
    }
  }, [])

  useEffect(() => {
    if (coordinates) {
      load(coordinates)
    }
  }, [coordinates, load])

  const refresh = useCallback(() => {
    if (coordinates) load(coordinates, true)
  }, [coordinates, load])

  return { ...state, refresh }
}
