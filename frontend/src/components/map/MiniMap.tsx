import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { Camera } from '../../lib/types'
import { cameraIcon } from './markerIcons'
import 'leaflet/dist/leaflet.css'

export function MiniMap({ cameras }: { cameras: Camera[] }) {
  return (
    <MapContainer center={[12.9726, 77.5980]} zoom={13} scrollWheelZoom={false} zoomControl={false}
      style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
      {cameras.map((cam) => (
        <Marker key={cam.camera_id} position={[cam.latitude, cam.longitude]} icon={cameraIcon}>
          <Popup>
            <div className="font-mono text-xs font-semibold">{cam.camera_id}</div>
            <div className="text-xs">{cam.name}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
