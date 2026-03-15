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

        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <span className="font-mono text-xs">Current location</span>
          </Popup>
        </Marker>

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

      <div className="absolute top-2 right-2 z-[1000] flex gap-2 bg-hud-bg/80 rounded px-2 py-1">
        <span className="text-[11px] text-hud-red flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-red/25 border border-hud-red inline-block" /> No-fly
        </span>
        <span className="text-[11px] text-hud-amber flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-amber/25 border border-hud-amber inline-block" /> Caution
        </span>
        <span className="text-[11px] text-hud-green flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-hud-green/25 border border-hud-green inline-block" /> Clear
        </span>
      </div>
    </div>
  )
}
