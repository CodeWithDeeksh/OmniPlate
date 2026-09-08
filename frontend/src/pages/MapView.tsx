import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { Shell } from '../components/layout/Shell'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { cameraIcon, alertIcon } from '../components/map/markerIcons'
import { Badge, severityTone } from '../components/ui/Badge'
import { timeAgo } from '../lib/format'
import 'leaflet/dist/leaflet.css'

const CENTER: [number, number] = [12.9726, 77.5980]
type Layer = 'cameras' | 'density' | 'alerts'

export function MapView() {
  const { data: cameras } = useAsync(() => api.getCameras(), [], 30000)
  const { data: density } = useAsync(() => api.getDensity(), [], 15000)
  const { data: alerts } = useAsync(() => api.getAlerts(), [], 10000)
  const [layer, setLayer] = useState<Layer>('cameras')

  const densityByCam = useMemo(() => {
    const m = new Map<string, number>()
    density?.forEach((d) => m.set(d.camera_id, d.vehicles_per_hour))
    return m
  }, [density])

  const maxVph = useMemo(() => Math.max(1, ...(density?.map((d) => d.vehicles_per_hour) ?? [1])), [density])

  const LAYERS: { id: Layer; label: string }[] = [
    { id: 'cameras', label: 'Cameras' },
    { id: 'density', label: 'Density' },
    { id: 'alerts', label: 'Alerts' },
  ]

  return (
    <Shell title="Live Map" subtitle="Camera network and real-time signals" alertCount={alerts?.length} noPadding>
      <div className="relative h-full">
        {/* Layer toggle */}
        <div className="absolute top-4 right-4 z-[1000] bg-surface-card border border-surface-border rounded-xl p-1 flex gap-1 shadow-card-md">
          {LAYERS.map((l) => (
            <button key={l.id} onClick={() => setLayer(l.id)}
              className={`px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${layer === l.id ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'}`}>
              {l.label}
            </button>
          ))}
        </div>

        <MapContainer center={CENTER} zoom={13} zoomControl style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>

          {layer === 'density' && cameras?.map((cam) => {
            const vph = densityByCam.get(cam.camera_id) ?? 0
            const intensity = vph / maxVph
            const radius = 10 + intensity * 24
            const color = intensity > 0.7 ? '#EF4444' : intensity > 0.4 ? '#F59E0B' : '#10B981'
            return (
              <CircleMarker key={cam.camera_id} center={[cam.latitude, cam.longitude]} radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}>
                <Popup><div className="font-semibold">{cam.name}</div><div className="text-ink-muted text-xs mt-1">{vph.toLocaleString('en-IN')} veh/hr</div></Popup>
              </CircleMarker>
            )
          })}

          {(layer === 'cameras' || layer === 'density') && cameras?.map((cam) => (
            <Marker key={cam.camera_id} position={[cam.latitude, cam.longitude]} icon={cameraIcon}>
              <Popup>
                <div className="font-mono text-xs font-semibold text-brand">{cam.camera_id}</div>
                <div className="font-medium mt-0.5">{cam.name}</div>
                <div className="text-ink-muted text-xs mt-1">{cam.road} · {cam.direction}</div>
                {densityByCam.has(cam.camera_id) && <div className="text-xs mt-1 font-mono">{densityByCam.get(cam.camera_id)?.toLocaleString('en-IN')} veh/hr</div>}
              </Popup>
            </Marker>
          ))}

          {layer === 'alerts' && alerts?.map((alert) => {
            const cam = cameras?.find((c) => c.camera_id === alert.camera_id)
            if (!cam) return null
            return (
              <Marker key={alert.alert_id} position={[cam.latitude, cam.longitude]} icon={alertIcon}>
                <Popup>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                    <span className="text-xs text-ink-muted">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <div className="font-mono font-semibold">{alert.plate_number}</div>
                  <div className="text-xs text-ink-muted mt-1">{alert.message}</div>
                  <div className="text-xs text-ink-faint mt-1">{cam.name}</div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </Shell>
  )
}
