import L from 'leaflet'

function svgIcon(color: string, pulse = false) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:14px;height:14px;">
      ${pulse ? `<div style="position:absolute;inset:-8px;border-radius:9999px;background:${color};opacity:0.2;animation:pulseDot 1.6s ease-in-out infinite;"></div>` : ''}
      <div style="position:absolute;inset:0;border-radius:9999px;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export const cameraIcon = svgIcon('#1D4ED8')
export const alertIcon = svgIcon('#EF4444', true)
export const vehicleIcon = svgIcon('#F59E0B')
export const trajectoryIcon = svgIcon('#10B981')
