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
  spot?: Spot
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
