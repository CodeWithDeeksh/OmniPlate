// Security utilities — sanitize, validate, and guard inputs

/** Strip any HTML tags from user input before display */
export function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c] ?? c))
}

/** Validate Indian vehicle plate format (lenient — covers old + new formats) */
export function isValidPlate(plate: string): boolean {
  const cleaned = plate.trim().toUpperCase().replace(/\s+/g, '')
  return /^[A-Z]{2}[\d]{1,2}[A-Z]{1,3}[\d]{1,4}$/.test(cleaned)
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s+/g, '')
}

/** Content-Security-Policy meta tag — injected at runtime */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",      // Vite dev needs unsafe-inline; production build drops it
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  "connect-src 'self' http://localhost:8000 http://localhost:8080",
  "frame-ancestors 'none'",
].join('; ')

/** Append CSP as meta tag if not server-set */
export function applyRuntimeCSP() {
  if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = CSP
  document.head.appendChild(meta)
}

/** RBAC helpers */
export const ROLE_PERMISSIONS = {
  admin:    { canViewBlacklist: true,  canExport: true,  canViewAudit: true,  canSearchVehicle: true },
  operator: { canViewBlacklist: true,  canExport: false, canViewAudit: false, canSearchVehicle: true },
  viewer:   { canViewBlacklist: false, canExport: false, canViewAudit: false, canSearchVehicle: true },
} as const

export type Permission = keyof typeof ROLE_PERMISSIONS['admin']
