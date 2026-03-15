# Flight Control Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA for FPV pilots to check weather conditions and airspace restrictions with a go/no-go dashboard.

**Architecture:** React SPA with three tabs (Dashboard, Spots, Settings). Weather from Open-Meteo, airspace from OpenAIP, map via Leaflet/OSM. All user data in localStorage. Dark terminal HUD theme with monospace typography.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Leaflet, Open-Meteo API, OpenAIP API, vite-plugin-pwa, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-03-15-flight-control-design.md`

---

## Chunk 1: Project Scaffold & Core Types

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold project with Vite**

```bash
npm create vite@latest . -- --template react-ts
```

Accept overwrite prompts if any. This creates the base React+TS project.

- [ ] **Step 2: Install dependencies**

```bash
npm install leaflet react-leaflet @types/leaflet tailwindcss @tailwindcss/vite
npm install -D vite-plugin-pwa
```

- [ ] **Step 3: Configure Tailwind v4**

Replace `src/App.css` with:

```css
@import "tailwindcss";

@theme {
  --color-hud-bg: #0a0e17;
  --color-hud-panel: #111927;
  --color-hud-border: #1e3a5f;
  --color-hud-cyan: #00e5ff;
  --color-hud-green: #00ff66;
  --color-hud-amber: #ffaa00;
  --color-hud-red: #ff4444;
  --color-hud-text: #c8d6e5;
  --color-hud-muted: #5a7a9a;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}
```

- [ ] **Step 4: Configure Vite with Tailwind and PWA plugins**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/flight-control/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Flight Control',
        short_name: 'FlightCtrl',
        description: 'FPV pilot weather & airspace companion',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'weather-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 5: Create `.env.example`**

```
VITE_OPENAIP_API_KEY=your_api_key_here
```

- [ ] **Step 6: Update `.gitignore`**

Append to the Vite-generated `.gitignore`:

```
.env
.env.local
.superpowers/
```

- [ ] **Step 7: Set up base HTML with monospace font**

Replace `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="icons/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0a0e17" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
    <title>Flight Control</title>
  </head>
  <body class="bg-hud-bg text-hud-text font-mono">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create placeholder App component**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <div className="p-4 text-hud-cyan">Dashboard</div>}
        {activeTab === 'spots' && <div className="p-4 text-hud-cyan">Spots</div>}
        {activeTab === 'settings' && <div className="p-4 text-hud-cyan">Settings</div>}
      </div>
      <nav className="bg-hud-panel border-t border-hud-border grid grid-cols-3">
        {(['dashboard', 'spots', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-center text-[10px] tracking-widest uppercase ${
              activeTab === tab ? 'text-hud-cyan' : 'text-hud-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}
```

- [ ] **Step 9: Verify the app runs**

```bash
npm run dev
```

Expected: App opens at localhost:5173 with dark background, bottom nav with three tabs, monospace font.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project with Tailwind and PWA"
```

### Task 2: Define shared types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write all shared TypeScript types**

Create `src/types.ts`:

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared TypeScript types and default settings"
```

### Task 3: localStorage hook

**Files:**
- Create: `src/hooks/useStorage.ts`
- Create: `src/hooks/__tests__/useStorage.test.ts`

- [ ] **Step 1: Install Vitest and testing deps**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add to the top of `vite.config.ts`, before the existing imports:

```ts
/// <reference types="vitest" />
```

Then add this `test` block inside the `defineConfig({...})` object, after the `plugins` array:

```ts
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing test for useStorage**

Create `src/hooks/__tests__/useStorage.test.ts`:

```ts
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
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- src/hooks/__tests__/useStorage.test.ts
```

Expected: FAIL — `useStorage` not found.

- [ ] **Step 4: Implement useStorage**

Create `src/hooks/useStorage.ts`:

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- src/hooks/__tests__/useStorage.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useStorage.ts src/hooks/__tests__/useStorage.test.ts vite.config.ts package.json package-lock.json
git commit -m "feat: add useStorage hook with tests"
```

### Task 4: Go/No-Go logic

**Files:**
- Create: `src/utils/goNoGo.ts`
- Create: `src/utils/__tests__/goNoGo.test.ts`

- [ ] **Step 1: Write failing tests for goNoGo**

Create `src/utils/__tests__/goNoGo.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeStatus } from '../goNoGo'
import { DEFAULT_SETTINGS } from '../../types'
import type { WeatherData } from '../../types'

const calm: WeatherData = {
  windSpeed: 5,
  windGusts: 8,
  visibility: 15,
  precipProbability: 0,
  temperature: 20,
  weatherCode: 0,
  hourly: [],
}

describe('computeStatus', () => {
  it('returns GO when all conditions within limits', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('go')
    expect(result.reasons).toHaveLength(0)
  })

  it('returns NO-GO when wind exceeds max', () => {
    const windy = { ...calm, windSpeed: 30 }
    const result = computeStatus(windy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Wind')
  })

  it('returns NO-GO when gusts exceed max', () => {
    const gusty = { ...calm, windGusts: 40 }
    const result = computeStatus(gusty, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Gusts')
  })

  it('returns NO-GO when visibility below min', () => {
    const foggy = { ...calm, visibility: 2 }
    const result = computeStatus(foggy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Visibility')
  })

  it('returns NO-GO when precipitation exceeds max', () => {
    const rainy = { ...calm, precipProbability: 50 }
    const result = computeStatus(rainy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Precipitation')
  })

  it('returns CAUTION when value in caution zone', () => {
    // maxWind=25, cautionZone=0.8, so caution at 25*0.8=20
    const breezy = { ...calm, windSpeed: 22 }
    const result = computeStatus(breezy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('caution')
  })

  it('returns CAUTION for visibility in caution zone', () => {
    // minVisibility=3, cautionZone=0.8, caution at 3/0.8=3.75
    const hazy = { ...calm, visibility: 3.5 }
    const result = computeStatus(hazy, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('caution')
  })

  it('returns NO-GO when in restricted airspace', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, true, false)
    expect(result.status).toBe('no-go')
    expect(result.reasons).toContain('Restricted airspace')
  })

  it('returns CAUTION when in controlled airspace', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, true)
    expect(result.status).toBe('caution')
    expect(result.reasons).toContain('Controlled airspace')
  })

  it('NO-GO takes priority over CAUTION', () => {
    const bad = { ...calm, windSpeed: 30, windGusts: 10 }
    const result = computeStatus(bad, DEFAULT_SETTINGS, false, false)
    expect(result.status).toBe('no-go')
  })

  it('includes all check statuses in result', () => {
    const result = computeStatus(calm, DEFAULT_SETTINGS, false, false)
    expect(result.checks).toHaveLength(4)
    expect(result.checks.map(c => c.name)).toEqual(['Wind', 'Gusts', 'Visibility', 'Precipitation'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/utils/__tests__/goNoGo.test.ts
```

Expected: FAIL — `computeStatus` not found.

- [ ] **Step 3: Implement computeStatus**

Create `src/utils/goNoGo.ts`:

```ts
import type { WeatherData, Settings, GoNoGoResult, StatusCheck, FlightStatus } from '../types'

function checkNormal(name: string, value: number, limit: number, unit: string, cautionZone: number): StatusCheck {
  let status: FlightStatus = 'go'
  if (value > limit) status = 'no-go'
  else if (value > limit * cautionZone) status = 'caution'
  return { name, value, limit, unit, status }
}

function checkVisibility(value: number, limit: number, unit: string, cautionZone: number): StatusCheck {
  let status: FlightStatus = 'go'
  if (value < limit) status = 'no-go'
  else if (value < limit / cautionZone) status = 'caution'
  return { name: 'Visibility', value, limit, unit, status }
}

export function computeStatus(
  weather: WeatherData,
  settings: Settings,
  inRestrictedAirspace: boolean,
  inCautionAirspace: boolean,
): GoNoGoResult {
  const checks: StatusCheck[] = [
    checkNormal('Wind', weather.windSpeed, settings.maxWind, 'km/h', settings.cautionZone),
    checkNormal('Gusts', weather.windGusts, settings.maxGust, 'km/h', settings.cautionZone),
    checkVisibility(weather.visibility, settings.minVisibility, 'km', settings.cautionZone),
    checkNormal('Precipitation', weather.precipProbability, settings.maxPrecip, '%', settings.cautionZone),
  ]

  const reasons: string[] = []
  const cautionReasons: string[] = []

  if (inRestrictedAirspace) {
    reasons.push('Restricted airspace')
  }

  if (inCautionAirspace) {
    cautionReasons.push('Controlled airspace')
  }

  for (const check of checks) {
    if (check.status === 'no-go') {
      reasons.push(check.name)
    }
  }

  if (reasons.length > 0) {
    return { status: 'no-go', checks, reasons }
  }

  const hasCaution = checks.some((c) => c.status === 'caution') || cautionReasons.length > 0
  if (hasCaution) {
    return { status: 'caution', checks, reasons: cautionReasons }
  }

  return { status: 'go', checks, reasons: [] }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/utils/__tests__/goNoGo.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/goNoGo.ts src/utils/__tests__/goNoGo.test.ts
git commit -m "feat: add go/no-go status computation with tests"
```

### Task 5: Unit conversion utility

**Files:**
- Create: `src/utils/units.ts`
- Create: `src/utils/__tests__/units.test.ts`

- [ ] **Step 1: Write failing tests for unit conversion**

Create `src/utils/__tests__/units.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/utils/__tests__/units.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement unit conversion**

Create `src/utils/units.ts`:

```ts
import type { Units } from '../types'

const KM_TO_MI = 0.621371

export function convertSpeed(kmh: number, units: Units): number {
  return units === 'imperial' ? kmh * KM_TO_MI : kmh
}

export function convertDistance(km: number, units: Units): number {
  return units === 'imperial' ? km * KM_TO_MI : km
}

export function speedUnit(units: Units): string {
  return units === 'imperial' ? 'mph' : 'km/h'
}

export function distanceUnit(units: Units): string {
  return units === 'imperial' ? 'mi' : 'km'
}

export function formatValue(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/utils/__tests__/units.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/units.ts src/utils/__tests__/units.test.ts
git commit -m "feat: add unit conversion utilities with tests"
```

## Chunk 2: Data Hooks & API Integration

### Task 6: useLocation hook

**Files:**
- Create: `src/hooks/useLocation.ts`

- [ ] **Step 1: Implement useLocation**

Create `src/hooks/useLocation.ts`:

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLocation.ts
git commit -m "feat: add useLocation hook with fallback and manual override"
```

### Task 7: useWeather hook

**Files:**
- Create: `src/hooks/useWeather.ts`

- [ ] **Step 1: Implement useWeather**

Create `src/hooks/useWeather.ts`:

```ts
import { useState, useEffect, useCallback } from 'react'
import type { Coordinates, WeatherData, HourlyForecast } from '../types'

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

  return {
    windSpeed: json.current.wind_speed_10m,
    windGusts: json.current.wind_gusts_10m,
    visibility: json.current.visibility / 1000, // API returns meters, we use km
    precipProbability: json.current.precipitation_probability,
    temperature: json.current.temperature_2m,
    weatherCode: json.current.weather_code,
    hourly,
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
      // Try to show cached data as stale
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useWeather.ts
git commit -m "feat: add useWeather hook with Open-Meteo integration and caching"
```

### Task 8: useAirspace hook

**Files:**
- Create: `src/hooks/useAirspace.ts`

- [ ] **Step 1: Implement useAirspace**

Create `src/hooks/useAirspace.ts`:

```ts
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
    dist: '25000', // 25km radius in meters
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
    // Both point and polygon use [lng, lat] convention (GeoJSON standard)
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAirspace.ts
git commit -m "feat: add useAirspace hook with OpenAIP integration and caching"
```

## Chunk 3: UI Components

### Task 9: BottomNav component

**Files:**
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 1: Implement BottomNav**

Create `src/components/BottomNav.tsx`:

```tsx
type Tab = 'dashboard' | 'spots' | 'settings'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '◎' },
  { id: 'spots', label: 'SPOTS', icon: '★' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bg-hud-panel border-t border-hud-border grid grid-cols-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`py-3 text-center transition-colors ${
            active === tab.id ? 'text-hud-cyan' : 'text-hud-muted'
          }`}
        >
          <div className="text-base mb-0.5">{tab.icon}</div>
          <div className="text-[10px] tracking-[0.15em] uppercase">{tab.label}</div>
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Update App.tsx to use BottomNav**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <div className="p-4 text-hud-cyan">Dashboard</div>}
        {activeTab === 'spots' && <div className="p-4 text-hud-cyan">Spots</div>}
        {activeTab === 'settings' && <div className="p-4 text-hud-cyan">Settings</div>}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
```

- [ ] **Step 3: Verify app runs with bottom nav**

```bash
npm run dev
```

Expected: Bottom nav renders with three tabs, active tab highlighted in cyan.

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomNav.tsx src/App.tsx
git commit -m "feat: add BottomNav component"
```

### Task 10: GoNoGoHero component

**Files:**
- Create: `src/components/GoNoGoHero.tsx`

- [ ] **Step 1: Implement GoNoGoHero**

Create `src/components/GoNoGoHero.tsx`:

```tsx
import type { FlightStatus } from '../types'

const statusConfig: Record<FlightStatus, { label: string; colors: string; glow: string }> = {
  go: {
    label: 'GO',
    colors: 'from-[#0d2818] to-[#0a1a0a] border-hud-green/25 text-hud-green',
    glow: 'shadow-[0_0_30px_rgba(0,255,102,0.15)]',
  },
  caution: {
    label: 'CAUTION',
    colors: 'from-[#2d2200] to-[#1a1400] border-hud-amber/25 text-hud-amber',
    glow: 'shadow-[0_0_30px_rgba(255,170,0,0.15)]',
  },
  'no-go': {
    label: 'NO-GO',
    colors: 'from-[#2d0a0a] to-[#1a0505] border-hud-red/25 text-hud-red',
    glow: 'shadow-[0_0_30px_rgba(255,68,68,0.15)]',
  },
}

interface GoNoGoHeroProps {
  status: FlightStatus
  reasons: string[]
  loading: boolean
}

export function GoNoGoHero({ status, reasons, loading }: GoNoGoHeroProps) {
  if (loading) {
    return (
      <div className="mx-3 mt-3 rounded-lg border border-hud-border bg-gradient-to-br from-hud-panel to-hud-bg p-4 text-center">
        <div className="text-[11px] tracking-[0.2em] text-hud-muted mb-1">STATUS</div>
        <div className="text-2xl text-hud-muted animate-pulse">CHECKING...</div>
      </div>
    )
  }

  const config = statusConfig[status]

  return (
    <div className={`mx-3 mt-3 rounded-lg border bg-gradient-to-br p-4 text-center ${config.colors} ${config.glow}`}>
      <div className="text-[11px] tracking-[0.2em] text-current/50 mb-1">STATUS</div>
      <div className="text-4xl font-bold tracking-wider">{config.label}</div>
      <div className="text-[11px] text-current/50 mt-1">
        {reasons.length > 0
          ? reasons.join(' • ')
          : 'All conditions within limits'}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/GoNoGoHero.tsx
git commit -m "feat: add GoNoGoHero status display component"
```

### Task 11: WeatherStrip component

**Files:**
- Create: `src/components/WeatherStrip.tsx`

- [ ] **Step 1: Implement WeatherStrip**

Create `src/components/WeatherStrip.tsx`:

```tsx
import type { StatusCheck, FlightStatus, Units } from '../types'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusColor: Record<FlightStatus, string> = {
  go: 'text-hud-cyan',
  caution: 'text-hud-amber',
  'no-go': 'text-hud-red',
}

interface WeatherStripProps {
  checks: StatusCheck[]
  units: Units
}

export function WeatherStrip({ checks, units }: WeatherStripProps) {
  return (
    <div className="grid grid-cols-4 gap-2 px-3 mb-3">
      {checks.map((check) => {
        const isDistance = check.name === 'Visibility'
        const displayValue = isDistance
          ? convertDistance(check.value, units)
          : check.name === 'Precipitation'
            ? check.value
            : convertSpeed(check.value, units)
        const displayUnit = isDistance
          ? distanceUnit(units)
          : check.name === 'Precipitation'
            ? '%'
            : speedUnit(units)

        return (
          <div
            key={check.name}
            className="bg-hud-panel rounded-md p-2 text-center border border-hud-border"
          >
            <div className="text-[9px] tracking-[0.1em] text-hud-muted uppercase">
              {check.name}
            </div>
            <div className={`text-lg font-bold ${statusColor[check.status]}`}>
              {formatValue(displayValue)}
            </div>
            <div className="text-[9px] text-hud-muted">{displayUnit}</div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/WeatherStrip.tsx
git commit -m "feat: add WeatherStrip weather data display component"
```

### Task 12: Map component

**Files:**
- Create: `src/components/Map.tsx`
- Create: `src/vite-env.d.ts` (if not already created by Vite scaffold)

- [ ] **Step 1: Ensure Vite env type declarations exist**

Check if `src/vite-env.d.ts` exists (Vite scaffold creates it). If it does, verify it contains `/// <reference types="vite/client" />` which provides `*.png` module declarations. If it doesn't exist, create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

This gives TypeScript knowledge of Vite's asset import types (`.png`, `.svg`, etc.).

- [ ] **Step 2: Add Leaflet CSS import**

Add to the top of `src/App.css`, before the Tailwind import:

```css
@import 'leaflet/dist/leaflet.css';
```

- [ ] **Step 3: Implement Map component**

Create `src/components/Map.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Coordinates, AirspaceZone, Spot } from '../types'

// Fix default marker icon path issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const RESTRICTED_TYPES = ['RESTRICTED', 'DANGER', 'PROHIBITED']
const CAUTION_TYPES = ['CTR', 'TMA']

function airspaceColor(zone: AirspaceZone): string {
  if (RESTRICTED_TYPES.includes(zone.type)) return '#ff4444'
  if (CAUTION_TYPES.includes(zone.type)) return '#ffaa00'
  return '#00ff66'
}

// Sub-component to recenter map when coordinates change
function MapRecenter({ coords }: { coords: Coordinates }) {
  const map = useMap()
  const prevCoords = useRef(coords)
  useEffect(() => {
    if (
      coords.lat !== prevCoords.current.lat ||
      coords.lng !== prevCoords.current.lng
    ) {
      map.flyTo([coords.lat, coords.lng], map.getZoom())
      prevCoords.current = coords
    }
  }, [coords, map])
  return null
}

interface MapProps {
  coordinates: Coordinates
  airspaceZones: AirspaceZone[]
  spots: Spot[]
  onMapClick?: (coords: Coordinates) => void
}

export function Map({ coordinates, airspaceZones, spots, onMapClick }: MapProps) {
  return (
    <div className="relative flex-1 mx-3 mb-3 rounded-lg border border-hud-border overflow-hidden">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        className="h-full w-full"
        style={{ background: '#0d1117' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapRecenter coords={coordinates} />

        {/* Current location marker */}
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <span className="font-mono text-xs">Current location</span>
          </Popup>
        </Marker>

        {/* Airspace overlays */}
        {airspaceZones.map((zone) =>
          zone.geometry?.[0] ? (
            <Polygon
              key={zone.id}
              positions={zone.geometry[0].map(([lng, lat]) => [lat, lng] as [number, number])}
              pathOptions={{
                color: airspaceColor(zone),
                fillColor: airspaceColor(zone),
                fillOpacity: 0.15,
                weight: 1,
              }}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <div className="font-bold">{zone.name}</div>
                  <div>Class: {zone.class} | Type: {zone.type}</div>
                  <div>{zone.lowerLimit}m - {zone.upperLimit}m</div>
                </div>
              </Popup>
            </Polygon>
          ) : null,
        )}

        {/* Saved spots markers */}
        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <div className="font-mono text-xs">
                <div className="font-bold">{spot.name}</div>
                {spot.notes && <div className="mt-1">{spot.notes}</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {onMapClick && <MapClickHandler onClick={onMapClick} />}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-2 bg-hud-bg/80 rounded px-2 py-1">
        <span className="text-[9px] text-hud-red flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-red/25 border border-hud-red inline-block" /> No-fly
        </span>
        <span className="text-[9px] text-hud-amber flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-amber/25 border border-hud-amber inline-block" /> Caution
        </span>
        <span className="text-[9px] text-hud-green flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-green/25 border border-hud-green inline-block" /> Clear
        </span>
      </div>
    </div>
  )
}

function MapClickHandler({ onClick }: { onClick: (coords: Coordinates) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [map, onClick])
  return null
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Map.tsx src/App.css src/vite-env.d.ts
git commit -m "feat: add Map component with airspace overlays and spot markers"
```

### Task 13: Dashboard component (wiring it all together)

**Files:**
- Create: `src/components/Dashboard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Dashboard**

Create `src/components/Dashboard.tsx`:

```tsx
import { GoNoGoHero } from './GoNoGoHero'
import { WeatherStrip } from './WeatherStrip'
import { Map } from './Map'
import { computeStatus } from '../utils/goNoGo'
import { useWeather } from '../hooks/useWeather'
import { useAirspace } from '../hooks/useAirspace'
import { useLocation } from '../hooks/useLocation'
import { useStorage } from '../hooks/useStorage'
import type { Settings, Spot, GoNoGoResult } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const defaultResult: GoNoGoResult = {
  status: 'go',
  checks: [],
  reasons: [],
}

export function Dashboard() {
  const [settings] = useStorage<Settings>('fc-settings', DEFAULT_SETTINGS)
  const [spots] = useStorage<Spot[]>('fc-spots', [])
  const location = useLocation()
  const weather = useWeather(location.coordinates)
  const airspace = useAirspace(location.coordinates)

  const result = weather.data
    ? computeStatus(weather.data, settings, airspace.inRestricted, airspace.inCaution)
    : defaultResult

  const loading = location.loading || weather.loading

  return (
    <div className="flex flex-col h-full">
      {/* App header */}
      <div className="bg-hud-panel px-4 py-2.5 flex justify-between items-center border-b border-hud-border">
        <div className="text-sm font-bold text-hud-cyan tracking-[0.15em]">⬡ FLIGHT CONTROL</div>
        <button
          onClick={weather.refresh}
          className="text-[11px] text-hud-muted hover:text-hud-cyan transition-colors tracking-wider"
        >
          ↻ REFRESH
        </button>
      </div>

      {/* Stale data warning */}
      {weather.stale && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-amber/10 border border-hud-amber/25 rounded text-[10px] text-hud-amber tracking-wider">
          SHOWING CACHED DATA • {weather.error}
        </div>
      )}

      {/* Location error */}
      {location.error && !location.coordinates && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-hud-red/10 border border-hud-red/25 rounded text-[10px] text-hud-red tracking-wider">
          {location.error}
        </div>
      )}

      <GoNoGoHero
        status={result.status}
        reasons={result.reasons}
        loading={loading}
      />

      {weather.data && (
        <div className="mt-3">
          <WeatherStrip checks={result.checks} units={settings.units} />
        </div>
      )}

      {location.coordinates && (
        <Map
          coordinates={location.coordinates}
          airspaceZones={airspace.zones}
          spots={spots}
          onMapClick={location.setManualLocation}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire Dashboard into App.tsx**

Update `src/App.tsx` — replace the dashboard placeholder:

```tsx
import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'spots' && <div className="p-4 text-hud-cyan">Spots</div>}
        {activeTab === 'settings' && <div className="p-4 text-hud-cyan">Settings</div>}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
```

- [ ] **Step 3: Verify app runs with full dashboard**

```bash
npm run dev
```

Expected: Dashboard shows loading state → go/no-go hero + weather strip + map with current location. If location is denied, shows error message.

- [ ] **Step 4: Commit**

```bash
git add src/components/Dashboard.tsx src/App.tsx
git commit -m "feat: add Dashboard component wiring hero, weather, and map together"
```

## Chunk 4: Spots, Settings & Deployment

### Task 14: SpotCard component

**Files:**
- Create: `src/components/SpotCard.tsx`

- [ ] **Step 1: Implement SpotCard**

Create `src/components/SpotCard.tsx`:

```tsx
import { useRef } from 'react'
import type { Spot, FlightStatus, Units } from '../types'
import { convertSpeed, convertDistance, speedUnit, distanceUnit, formatValue } from '../utils/units'

const statusLabel: Record<FlightStatus, { text: string; color: string }> = {
  go: { text: 'GO', color: 'text-hud-green' },
  caution: { text: 'CAUTION', color: 'text-hud-amber' },
  'no-go': { text: 'NO-GO', color: 'text-hud-red' },
}

interface SpotCardProps {
  spot: Spot
  status: FlightStatus
  windSpeed?: number
  windGusts?: number
  visibility?: number
  units: Units
  onTap: () => void
  onLongPress: () => void
}

export function SpotCard({ spot, status, windSpeed, windGusts, visibility, units, onTap, onLongPress }: SpotCardProps) {
  const label = statusLabel[status]
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress()
      longPressTimer.current = null
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
      onTap()
    }
  }

  return (
    <div
      className="mx-3 mb-2 bg-hud-panel rounded-md border border-hud-border p-3 cursor-pointer active:bg-hud-border/30 transition-colors"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-[13px] text-hud-text font-bold tracking-wider">{spot.name}</div>
        <div className={`text-[11px] font-bold tracking-wider ${label.color}`}>{label.text} ●</div>
      </div>
      <div className="text-[10px] text-hud-muted tracking-wide mb-1.5">
        {spot.lat.toFixed(4)}° N, {spot.lng.toFixed(4)}° E
      </div>
      {spot.notes && (
        <div className="text-[10px] text-hud-muted/70 leading-relaxed mb-2">{spot.notes}</div>
      )}
      {windSpeed !== undefined && (
        <div className="flex gap-3 text-[9px] text-hud-muted tracking-wider">
          <span>WIND {formatValue(convertSpeed(windSpeed, units))} {speedUnit(units)}</span>
          {windGusts !== undefined && (
            <span>GUST {formatValue(convertSpeed(windGusts, units))} {speedUnit(units)}</span>
          )}
          {visibility !== undefined && (
            <span>VIS {formatValue(convertDistance(visibility, units))} {distanceUnit(units)}</span>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SpotCard.tsx
git commit -m "feat: add SpotCard component with tap and long-press"
```

### Task 15: SpotEditor component

**Files:**
- Create: `src/components/SpotEditor.tsx`

- [ ] **Step 1: Implement SpotEditor**

Create `src/components/SpotEditor.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Spot, Coordinates } from '../types'

function MapPickHandler({ onPick }: { onPick: (coords: Coordinates) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [map, onPick])
  return null
}

interface SpotEditorProps {
  spot?: Spot  // undefined = creating new, defined = editing
  currentLocation: Coordinates | null
  onSave: (spot: Omit<Spot, 'id' | 'createdAt'> & { id?: string }) => void
  onDelete?: () => void
  onCancel: () => void
}

export function SpotEditor({ spot, currentLocation, onSave, onDelete, onCancel }: SpotEditorProps) {
  const [name, setName] = useState(spot?.name ?? '')
  const [notes, setNotes] = useState(spot?.notes ?? '')
  const [lat, setLat] = useState(spot?.lat ?? currentLocation?.lat ?? 0)
  const [lng, setLng] = useState(spot?.lng ?? currentLocation?.lng ?? 0)
  const [useCurrentLoc, setUseCurrentLoc] = useState(!spot)
  const [showMap, setShowMap] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    const coords = useCurrentLoc && currentLocation ? currentLocation : { lat, lng }
    onSave({
      ...(spot ? { id: spot.id } : {}),
      name: name.trim(),
      notes: notes.trim(),
      lat: coords.lat,
      lng: coords.lng,
    })
  }

  return (
    <div className="fixed inset-0 bg-hud-bg/90 z-50 flex items-center justify-center p-4">
      <div className="bg-hud-panel border border-hud-border rounded-lg w-full max-w-sm p-4">
        <div className="text-[11px] tracking-[0.2em] text-hud-cyan mb-4">
          {spot ? 'EDIT SPOT' : 'NEW SPOT'}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[9px] tracking-[0.15em] text-hud-muted block mb-1">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My flying spot"
              className="w-full bg-hud-bg border border-hud-border rounded px-3 py-2 text-sm text-hud-text font-mono placeholder:text-hud-muted/40 focus:border-hud-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[0.15em] text-hud-muted block mb-1">NOTES</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Parking nearby, watch for trees..."
              rows={3}
              className="w-full bg-hud-bg border border-hud-border rounded px-3 py-2 text-sm text-hud-text font-mono placeholder:text-hud-muted/40 focus:border-hud-cyan focus:outline-none resize-none"
            />
          </div>

          {!spot && (
            <div>
              <label className="text-[9px] tracking-[0.15em] text-hud-muted block mb-1">LOCATION</label>
              <div className="flex gap-2 mb-2">
                {currentLocation && (
                  <button
                    onClick={() => { setUseCurrentLoc(true); setShowMap(false) }}
                    className={`flex-1 py-2 text-[10px] tracking-wider rounded border ${
                      useCurrentLoc && !showMap
                        ? 'border-hud-cyan bg-hud-cyan/10 text-hud-cyan'
                        : 'border-hud-border text-hud-muted'
                    }`}
                  >
                    CURRENT LOCATION
                  </button>
                )}
                <button
                  onClick={() => { setUseCurrentLoc(false); setShowMap(true) }}
                  className={`flex-1 py-2 text-[10px] tracking-wider rounded border ${
                    showMap
                      ? 'border-hud-cyan bg-hud-cyan/10 text-hud-cyan'
                      : 'border-hud-border text-hud-muted'
                  }`}
                >
                  PICK ON MAP
                </button>
              </div>
              {showMap && (
                <div className="h-48 rounded border border-hud-border overflow-hidden mb-2">
                  <MapContainer
                    center={[lat || currentLocation?.lat || 46, lng || currentLocation?.lng || 14]}
                    zoom={13}
                    className="h-full w-full"
                    style={{ background: '#0d1117' }}
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker position={[lat, lng]} />
                    <MapPickHandler onPick={(coords) => { setLat(coords.lat); setLng(coords.lng) }} />
                  </MapContainer>
                  <div className="text-[9px] text-hud-muted text-center py-1">
                    Tap the map to set location • {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-[10px] tracking-wider text-hud-muted border border-hud-border rounded hover:text-hud-text transition-colors"
          >
            CANCEL
          </button>
          {spot && onDelete && (
            <button
              onClick={onDelete}
              className="py-2 px-4 text-[10px] tracking-wider text-hud-red border border-hud-red/25 rounded hover:bg-hud-red/10 transition-colors"
            >
              DELETE
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2 text-[10px] tracking-wider text-hud-cyan border border-hud-cyan rounded hover:bg-hud-cyan/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {spot ? 'SAVE' : 'ADD SPOT'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SpotEditor.tsx
git commit -m "feat: add SpotEditor modal for adding and editing spots"
```

### Task 16: SpotsList component

**Files:**
- Create: `src/components/SpotsList.tsx`

- [ ] **Step 1: Implement SpotsList**

Create `src/components/SpotsList.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { SpotCard } from './SpotCard'
import { SpotEditor } from './SpotEditor'
import { useStorage } from '../hooks/useStorage'
import { useWeather } from '../hooks/useWeather'
import { computeStatus } from '../utils/goNoGo'
import type { Spot, Settings, Coordinates } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface SpotsListProps {
  currentLocation: Coordinates | null
  onNavigateToSpot: (coords: Coordinates) => void
}

export function SpotsList({ currentLocation, onNavigateToSpot }: SpotsListProps) {
  const [spots, setSpots] = useStorage<Spot[]>('fc-spots', [])
  const [settings] = useStorage<Settings>('fc-settings', DEFAULT_SETTINGS)
  const [editing, setEditing] = useState<Spot | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleSave = (data: Omit<Spot, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      setSpots((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)),
      )
    } else {
      const newSpot: Spot = {
        id: crypto.randomUUID(),
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      }
      setSpots((prev) => [...prev, newSpot])
    }
    setShowEditor(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setShowEditor(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-hud-panel px-4 py-2.5 flex justify-between items-center border-b border-hud-border">
        <div className="text-[13px] tracking-[0.15em] text-hud-cyan">SAVED SPOTS</div>
        <button
          onClick={() => { setEditing(null); setShowEditor(true) }}
          className="text-[11px] text-hud-cyan border border-hud-cyan/30 px-2.5 py-1 rounded tracking-wider hover:bg-hud-cyan/10 transition-colors"
        >
          + ADD
        </button>
      </div>

      {/* Spots list */}
      <div className="flex-1 overflow-auto pt-2">
        {spots.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-8">
            <div>
              <div className="text-hud-muted/50 text-2xl mb-2">★</div>
              <div className="text-[11px] text-hud-muted/50 tracking-wider leading-relaxed">
                No saved spots yet.<br />
                Tap + ADD to save your first flying location.
              </div>
            </div>
          </div>
        ) : (
          spots.map((spot) => (
            <SpotCardWithWeather
              key={spot.id}
              spot={spot}
              settings={settings}
              onTap={() => onNavigateToSpot({ lat: spot.lat, lng: spot.lng })}
              onLongPress={() => { setEditing(spot); setShowEditor(true) }}
            />
          ))
        )}
      </div>

      {showEditor && (
        <SpotEditor
          spot={editing ?? undefined}
          currentLocation={currentLocation}
          onSave={handleSave}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
          onCancel={() => { setShowEditor(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// Wrapper that fetches weather for a single spot
function SpotCardWithWeather({
  spot,
  settings,
  onTap,
  onLongPress,
}: {
  spot: Spot
  settings: Settings
  onTap: () => void
  onLongPress: () => void
}) {
  const weather = useWeather({ lat: spot.lat, lng: spot.lng })
  const status = weather.data
    ? computeStatus(weather.data, settings, false, false).status
    : 'go'

  return (
    <SpotCard
      spot={spot}
      status={status}
      windSpeed={weather.data?.windSpeed}
      windGusts={weather.data?.windGusts}
      visibility={weather.data?.visibility}
      units={settings.units}
      onTap={onTap}
      onLongPress={onLongPress}
    />
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SpotsList.tsx
git commit -m "feat: add SpotsList with spot cards, editor modal, and per-spot weather"
```

### Task 17: Settings component

**Files:**
- Create: `src/components/ThresholdSlider.tsx`
- Create: `src/components/Settings.tsx`

- [ ] **Step 1: Implement ThresholdSlider**

Create `src/components/ThresholdSlider.tsx`:

```tsx
interface ThresholdSliderProps {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

export function ThresholdSlider({ label, description, value, min, max, step, unit, onChange }: ThresholdSliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="bg-hud-panel rounded-md border border-hud-border p-3 mb-2">
      <div className="flex justify-between items-center mb-1">
        <div>
          <div className="text-[11px] text-hud-text tracking-wider">{label}</div>
          <div className="text-[9px] text-hud-muted mt-0.5">{description}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-hud-cyan">{value}</span>
          <span className="text-[9px] text-hud-muted">{unit}</span>
        </div>
      </div>
      <div className="relative mt-2">
        <div className="h-1 bg-hud-border rounded-full">
          <div
            className="h-full rounded-full bg-gradient-to-r from-hud-green to-hud-cyan"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement Settings**

Create `src/components/Settings.tsx`:

```tsx
import { ThresholdSlider } from './ThresholdSlider'
import { useStorage } from '../hooks/useStorage'
import type { Settings as SettingsType, Units } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { speedUnit, distanceUnit } from '../utils/units'

export function Settings() {
  const [settings, setSettings] = useStorage<SettingsType>('fc-settings', DEFAULT_SETTINGS)

  const update = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const su = speedUnit(settings.units)
  const du = distanceUnit(settings.units)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-hud-panel px-4 py-2.5 border-b border-hud-border">
        <div className="text-[13px] tracking-[0.15em] text-hud-cyan">SETTINGS</div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {/* Units */}
        <div className="mb-4">
          <div className="text-[9px] tracking-[0.15em] text-hud-muted mb-2">UNITS</div>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as Units[]).map((u) => (
              <button
                key={u}
                onClick={() => update('units', u)}
                className={`flex-1 py-2 text-[11px] tracking-wider rounded border transition-colors ${
                  settings.units === u
                    ? 'border-hud-cyan bg-hud-cyan/10 text-hud-cyan'
                    : 'border-hud-border text-hud-muted'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Thresholds */}
        <div className="mb-4">
          <div className="text-[9px] tracking-[0.15em] text-hud-muted mb-2">GO/NO-GO THRESHOLDS</div>

          <ThresholdSlider
            label="MAX WIND"
            description="Sustained wind speed limit"
            value={settings.maxWind}
            min={5}
            max={60}
            step={1}
            unit={su}
            onChange={(v) => update('maxWind', v)}
          />
          <ThresholdSlider
            label="MAX GUST"
            description="Wind gust limit"
            value={settings.maxGust}
            min={10}
            max={80}
            step={1}
            unit={su}
            onChange={(v) => update('maxGust', v)}
          />
          <ThresholdSlider
            label="MIN VISIBILITY"
            description="Minimum acceptable visibility"
            value={settings.minVisibility}
            min={0.5}
            max={20}
            step={0.5}
            unit={du}
            onChange={(v) => update('minVisibility', v)}
          />
          <ThresholdSlider
            label="MAX PRECIPITATION"
            description="Rain probability limit"
            value={settings.maxPrecip}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => update('maxPrecip', v)}
          />
        </div>

        {/* Caution zone */}
        <div className="mb-4">
          <div className="text-[9px] tracking-[0.15em] text-hud-muted mb-2">CAUTION ZONE</div>
          <div className="bg-hud-panel rounded-md border border-hud-border p-3">
            <div className="text-[10px] text-hud-muted/70 leading-relaxed mb-2">
              CAUTION triggers when any value is within this percentage of your limit.
            </div>
            <div className="flex gap-2">
              {[0.7, 0.8, 0.9].map((z) => (
                <button
                  key={z}
                  onClick={() => update('cautionZone', z)}
                  className={`flex-1 py-1.5 text-[10px] tracking-wider rounded border transition-colors ${
                    settings.cautionZone === z
                      ? 'border-hud-amber bg-hud-amber/10 text-hud-amber'
                      : 'border-hud-border text-hud-muted'
                  }`}
                >
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ThresholdSlider.tsx src/components/Settings.tsx
git commit -m "feat: add Settings screen with threshold sliders and unit toggle"
```

### Task 18: Wire everything into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx with all tabs**

Replace `src/App.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import { SpotsList } from './components/SpotsList'
import { Settings } from './components/Settings'
import { useLocation } from './hooks/useLocation'
import type { Coordinates } from './types'
import './App.css'

type Tab = 'dashboard' | 'spots' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const location = useLocation()

  const handleNavigateToSpot = useCallback((coords: Coordinates) => {
    location.setManualLocation(coords)
    setActiveTab('dashboard')
  }, [location])

  return (
    <div className="h-dvh flex flex-col bg-hud-bg">
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'spots' && (
          <SpotsList
            currentLocation={location.coordinates}
            onNavigateToSpot={handleNavigateToSpot}
          />
        )}
        {activeTab === 'settings' && <Settings />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
```

- [ ] **Step 2: Verify app runs with all tabs**

```bash
npm run dev
```

Expected: All three tabs work — Dashboard with map/weather, Spots with add/edit/list, Settings with sliders.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire all tabs into App — dashboard, spots, and settings"
```

### Task 19: PWA icons and final build

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`

- [ ] **Step 1: Generate PWA icons**

Create minimal SVG-based icons using a build script. Create `scripts/generate-icons.mjs`:

```js
import { writeFileSync, mkdirSync } from 'fs'

function generateSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0a0e17"/>
  <text x="50%" y="45%" text-anchor="middle" dominant-baseline="central" fill="#00e5ff" font-family="monospace" font-size="${size * 0.35}" font-weight="bold">⬡</text>
  <text x="50%" y="72%" text-anchor="middle" dominant-baseline="central" fill="#00e5ff" font-family="monospace" font-size="${size * 0.09}" letter-spacing="2">FLIGHT CTRL</text>
</svg>`
}

mkdirSync('public/icons', { recursive: true })

// For now, save as SVG and convert — or use the SVGs directly
// In production you'd use sharp or canvas, but for MVP SVG icons work
writeFileSync('public/icons/icon-192.svg', generateSVG(192))
writeFileSync('public/icons/icon-512.svg', generateSVG(512))

console.log('Icons generated in public/icons/')
```

```bash
node scripts/generate-icons.mjs
```

Then update `vite.config.ts` manifest icons to use `.svg`:

```ts
icons: [
  { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
  { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
],
```

Also update `index.html` favicon:

```html
<link rel="icon" type="image/svg+xml" href="icons/icon-192.svg" />
```

- [ ] **Step 2: Verify production build**

```bash
npm run build
```

Expected: Build succeeds, `dist/` folder created with all assets.

- [ ] **Step 3: Commit**

```bash
git add public/icons/ scripts/ vite.config.ts index.html
git commit -m "feat: add PWA icons and verify production build"
```

### Task 20: GitHub Actions deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deployment workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build
        env:
          VITE_OPENAIP_API_KEY: ${{ secrets.VITE_OPENAIP_API_KEY }}

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Rename default branch to main**

```bash
git branch -m master main
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Final commit**

```bash
git add .github/
git commit -m "feat: add GitHub Actions workflow for Pages deployment"
```

- [ ] **Step 5: Create GitHub repo and push**

```bash
gh repo create flight-control --public --source=. --remote=origin --push
```

Expected: Repository created at `https://github.com/tadelv/flight-control`. Enable GitHub Pages in Settings → Pages → Source: GitHub Actions.

- [ ] **Step 6: Verify deployment**

After the Actions workflow completes, visit `https://tadelv.github.io/flight-control/` to confirm the app loads.
