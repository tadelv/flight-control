# Flight Control

A go/no-go dashboard for FPV drone pilots. Check weather conditions, airspace restrictions, and save your favorite flying spots — all in one place.

**Live app:** https://tadelv.github.io/flight-control/

## Features

- **Go/No-Go status** — instant verdict based on your personal thresholds for wind, gusts, visibility, and rain
- **Live weather** — current conditions and 12-hour forecast via Open-Meteo
- **Airspace overlay** — restricted zones, control zones, and TMA areas from OpenAIP displayed on the map
- **Saved spots** — save flying locations with notes, see conditions at each spot
- **Configurable thresholds** — set your own limits for wind, gusts, visibility, and precipitation
- **Caution zone** — early warning when conditions approach your limits
- **Metric/Imperial units**
- **UI scale slider** — adjust interface size from 80% to 200%
- **PWA** — installable, works offline with cached data

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Leaflet, Open-Meteo API, OpenAIP API

## Development

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and add your OpenAIP API key:

```
VITE_OPENAIP_API_KEY=your_key_here
```

Register for a free key at [openaip.net](https://www.openaip.net). The app works without it — you just won't see airspace data.

### Tests

```bash
npm test
```

### Build

```bash
npm run build
```

## Deployment

Deploys automatically to GitHub Pages via GitHub Actions on push to `main`. Add `VITE_OPENAIP_API_KEY` as a repository secret for airspace data in production.
