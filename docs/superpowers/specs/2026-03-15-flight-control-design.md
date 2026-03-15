# Flight Control — Design Spec

An FPV pilot weather and airspace companion app. Mobile-first PWA with a dark, terminal-inspired HUD aesthetic. Deployed as a single page app to GitHub Pages.

## Core Concept

A go/no-go dashboard that combines real-time weather conditions with airspace restriction data, evaluated against the pilot's personal thresholds. Open the app, see if you can fly — at your current location or any saved spot.

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS with a custom dark HUD theme, monospace typography throughout
- **Map:** Leaflet with OpenStreetMap tiles (free, no API key)
- **Weather:** Open-Meteo API (free, no API key)
- **Airspace:** OpenAIP API (free tier, requires API key registration)
- **Geolocation:** Browser Geolocation API
- **Storage:** localStorage for spots, settings, and caching
- **PWA:** vite-plugin-pwa for service worker, manifest, and offline support
- **Deployment:** GitHub Actions → GitHub Pages at `https://tadelv.github.io/flight-control/`

## Visual Identity

Dark cockpit / HUD aesthetic with a terminal feel:
- Background: deep navy-black (`#0a0e17`)
- Panels: dark blue-grey (`#111927`) with subtle borders (`#1e3a5f`)
- Primary accent: cyan (`#00e5ff`)
- Status colors: green (`#00ff66`) for GO, amber (`#ffaa00`) for CAUTION, red (`#ff4444`) for NO-GO
- Typography: monospace throughout (JetBrains Mono / Fira Code / Courier New fallback)
- Uppercase labels with letter-spacing for instrument readouts
- Subtle glows and gradients for status indicators

## App Structure

Three-tab single page app with bottom navigation:

### Tab 1: Dashboard (Home)

The primary screen with three zones stacked vertically:

**Go/No-Go Hero** — top of screen, impossible to miss:
- Large status word: GO / CAUTION / NO-GO
- Color-coded background gradient (green/amber/red)
- Brief reason text below (e.g., "All conditions within limits" or "Wind gusts exceed threshold")

**Weather Strip** — four data cells in a horizontal grid:
- Wind speed (sustained)
- Wind gusts
- Visibility
- Precipitation probability
- Each cell shows the value with unit, color-coded against thresholds (cyan = normal, amber = near limit, red = over limit)

**Interactive Map** — fills remaining space:
- Leaflet map centered on current location (or last known)
- OpenStreetMap dark-themed tiles
- Airspace overlays as colored polygons:
  - Red: no-fly / restricted zones
  - Amber: caution / controlled airspace
  - Green: clear areas
- Map legend in top-right corner
- Saved spots shown as markers
- Tap map to check conditions at any point
- Current location shown with a pulsing marker

### Tab 2: Spots

List of saved flying locations:

**Spot cards** — each displays:
- Name (user-defined)
- Coordinates
- Notes (user-defined, freeform text)
- Live mini-weather summary (wind, gust, visibility)
- Go/Caution/No-Go status indicator

**Interactions:**
- Tap a spot card → dashboard switches to that spot's location and conditions
- "+ ADD" button → opens a modal with two options: "Use current location" or "Pick on map". If picking on map, a full-screen map overlay appears with a crosshair — tap to confirm position. Then a form modal collects name and notes.
- Long-press a card → edit or delete options

### Tab 3: Settings

**Units toggle:** Metric (km/h, km) or Imperial (mph, mi)

**Go/No-Go Thresholds** — slider controls for each:
- Max wind speed (default: 25 km/h)
- Max gust speed (default: 35 km/h)
- Min visibility (default: 3 km)
- Max precipitation probability (default: 20%)

**Caution zone sensitivity:**
- Configurable percentage of limit at which CAUTION triggers (default: 80%)
- Options: 70%, 80%, 90%

## Data Architecture

### External APIs

**Open-Meteo** (weather):
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Parameters: latitude, longitude, current weather variables (wind_speed_10m, wind_gusts_10m, visibility, precipitation_probability, temperature_2m, weather_code)
- Also fetch hourly forecast for next 12 hours
- No authentication required

**OpenAIP** (airspace):
- Endpoint: `https://api.core.openaip.net/api/airspaces`
- Parameters: bounding box around current location
- Returns airspace polygons with class, name, altitude limits
- Requires API key (free tier: registration at openaip.net)
- API key stored as `VITE_OPENAIP_API_KEY` env var. For GitHub Actions deployment, configured as a repository secret.

### localStorage Schema

```
fc-spots: [
  {
    id: string (uuid),
    name: string,
    lat: number,
    lng: number,
    notes: string,
    createdAt: string (ISO date)
  }
]

fc-settings: {
  maxWind: number,        // km/h (stored in metric, converted for display)
  maxGust: number,        // km/h
  minVisibility: number,  // km
  maxPrecip: number,      // percentage
  cautionZone: number,    // 0.7 | 0.8 | 0.9
  units: "metric" | "imperial"
}

fc-weather-cache: {
  [coordKey: string]: {   // key = "lat,lng" rounded to 2 decimals
    data: WeatherResponse,
    timestamp: number
  }
}

fc-airspace-cache: {
  data: AirspaceResponse,
  timestamp: number,
  bounds: { north, south, east, west }
}

fc-last-location: {
  lat: number,
  lng: number
}
```

### Caching Strategy

- Weather: 10-minute TTL, re-fetched on manual refresh or location change. Cache is keyed by coordinate (rounded to 2 decimal places) so multiple spots don't thrash a single cache entry.
- Airspace: 24-hour TTL, re-fetched when map bounds change significantly
- Last location: updated on each successful geolocation

### Go/No-Go Logic

```
function computeStatus(weather, settings):
  // For normal checks: value > limit means NO-GO
  // For visibility: value < limit means NO-GO (inverted)

  normalChecks = [
    { value: weather.windSpeed, limit: settings.maxWind, name: "Wind" },
    { value: weather.windGusts, limit: settings.maxGust, name: "Gusts" },
    { value: weather.precipProbability, limit: settings.maxPrecip, name: "Precipitation" }
  ]

  if any normalCheck.value > normalCheck.limit → NO-GO
  if any normalCheck.value > normalCheck.limit * settings.cautionZone → CAUTION

  // Visibility is inverted: lower is worse
  if weather.visibility < settings.minVisibility → NO-GO
  if weather.visibility < settings.minVisibility / settings.cautionZone → CAUTION

  if in restricted airspace → NO-GO
  if in advisory airspace → CAUTION
  otherwise → GO
```

## PWA Configuration

- **Service worker:** Precache app shell and static assets. Runtime cache map tiles (NetworkFirst with 50MB limit). Runtime cache API responses (StaleWhileRevalidate).
- **Manifest:** `display: standalone`, dark theme color matching app background, custom icon set
- **Offline behavior:** Show last cached data with a "stale data" banner. Saved spots always accessible. Map shows cached tiles.
- **Install prompt:** Subtle banner after second visit suggesting home screen installation.

## Project Structure

```
flight-control/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Build + deploy to GitHub Pages
├── public/
│   └── icons/                  # PWA icons (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard: hero + weather + map
│   │   ├── GoNoGoHero.tsx      # Status display component
│   │   ├── WeatherStrip.tsx    # Four weather cells
│   │   ├── Map.tsx             # Leaflet map with airspace overlays
│   │   ├── SpotsList.tsx       # Saved spots list
│   │   ├── SpotCard.tsx        # Individual spot card
│   │   ├── SpotEditor.tsx      # Add/edit spot modal
│   │   ├── Settings.tsx        # Settings panel
│   │   ├── ThresholdSlider.tsx # Reusable slider component
│   │   └── BottomNav.tsx       # Tab navigation
│   ├── hooks/
│   │   ├── useWeather.ts       # Open-Meteo data fetching
│   │   ├── useAirspace.ts      # OpenAIP data fetching
│   │   ├── useLocation.ts      # Browser geolocation
│   │   └── useStorage.ts       # Typed localStorage wrapper
│   ├── utils/
│   │   ├── goNoGo.ts           # Status computation logic
│   │   └── units.ts            # Metric/imperial conversion
│   ├── types.ts                # Shared TypeScript types
│   ├── App.tsx                 # Root with tab routing
│   ├── App.css                 # Global styles / Tailwind imports
│   └── main.tsx                # Entry point
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Responsive Behavior

- **Mobile (< 768px):** Stacked layout as shown in mockups. Map takes remaining vertical space.
- **Desktop (>= 768px):** Side-by-side layout — weather strip and go/no-go on the left panel, map expanded on the right. Spots list can be a sidebar overlay on the map.

## Error Handling

- **No geolocation permission:** Show a prompt explaining why location is needed, fall back to manual map tap or last saved location.
- **API failures:** Show last cached data with a warning banner. Retry button available.
- **No internet:** PWA serves cached shell. Weather/airspace show stale data or "no data" state.
- **No saved spots:** Empty state with instructional text encouraging the user to save their first spot.
