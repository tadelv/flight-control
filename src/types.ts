export type FlightStatus = 'go' | 'caution' | 'no-go'

export type Units = 'metric' | 'imperial'

export interface Settings {
  maxWind: number        // km/h (always stored metric)
  maxGust: number        // km/h
  minVisibility: number  // km
  maxPrecip: number      // percentage 0-100
  cautionZone: number    // 0.7 | 0.8 | 0.9
  units: Units
}

export const DEFAULT_SETTINGS: Settings = {
  maxWind: 25,
  maxGust: 35,
  minVisibility: 3,
  maxPrecip: 20,
  cautionZone: 0.8,
  units: 'metric',
}

export interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  notes: string
  createdAt: string // ISO date
}

export interface WeatherData {
  windSpeed: number       // km/h
  windGusts: number       // km/h
  visibility: number      // km
  precipProbability: number // 0-100
  temperature: number     // Celsius
  weatherCode: number
  hourly: HourlyForecast[]
}

export interface HourlyForecast {
  time: string
  windSpeed: number
  windGusts: number
  precipProbability: number
}

export interface StatusCheck {
  name: string
  value: number
  limit: number
  unit: string
  status: FlightStatus
}

export interface GoNoGoResult {
  status: FlightStatus
  checks: StatusCheck[]
  reasons: string[]
}

export interface AirspaceZone {
  id: string
  name: string
  type: string        // e.g., "CTR", "TMA", "RESTRICTED", "DANGER"
  class: string       // A-G or RESTRICTED/DANGER/PROHIBITED
  lowerLimit: number  // meters
  upperLimit: number  // meters
  geometry: [number, number][][] // polygon coordinates [lng, lat][]
}

export interface Coordinates {
  lat: number
  lng: number
}
