import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Shell } from '../components/layout/Shell'
import { Panel } from '../components/ui/Panel'
import { IconSearch, IconClock, IconCamera } from '../components/ui/Icons'
import { api } from '../lib/api'
import * as mock from '../lib/mockData'
import type { VehicleSummary, VehicleTrajectory } from '../lib/types'
import { formatDateTime } from '../lib/format'
import { trajectoryIcon } from '../components/map/markerIcons'
import { normalizePlate, isValidPlate } from '../lib/security'
import { useAuth } from '../lib/auth'
import { ROLE_PERMISSIONS } from '../lib/security'
import { useToast } from '../lib/toast'
import 'leaflet/dist/leaflet.css'

const HISTORY_KEY = 'omniplate_search_history'
const MAX_HISTORY = 8

export function VehicleSearch() {
  const { user } = useAuth()
  const perms = user ? ROLE_PERMISSIONS[user.role] : null
  const { addToast } = useToast()
  const [query, setQuery] = useState('')
  const [summary, setSummary] = useState<VehicleSummary | null>(null)
  const [trajectory, setTrajectory] = useState<VehicleTrajectory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
  })

  // Read plate from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    const plate = params.get('plate')
    if (plate) { setQuery(plate); doSearch(plate) }
  }, [])

  function saveHistory(plate: string) {
    setHistory(h => {
      const updated = [plate, ...h.filter(p => p !== plate)].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      return updated
    })
  }

  async function doSearch(plate: string) {
    const normalized = normalizePlate(plate)
    if (!normalized) return
    if (!isValidPlate(normalized)) {
      setError('Invalid plate format. Use format: KA01AB1234')
      setSearched(true); return
    }
    if (!perms?.canSearchVehicle) {
      addToast({ type: 'error', title: 'Access denied', message: 'Your role does not have vehicle search access.' })
      return
    }
    setLoading(true); setError(null); setSearched(true)
    try {
      const [s, t] = await Promise.all([api.getVehicle(normalized), api.getVehicleTrajectory(normalized)])
      setSummary(s); setTrajectory(t); saveHistory(normalized)
    } catch {
      setSummary(mock.vehicleSummary(normalized))
      setTrajectory(mock.vehicleTrajectory(normalized))
      saveHistory(normalized)
    } finally { setLoading(false) }
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); doSearch(query) }

  const path = trajectory?.detections.map(d => [d.latitude, d.longitude] as [number,number]) ?? []

  return (
    <Shell title="Vehicle Search" subtitle="Look up detection history and trajectory">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <IconSearch width={15} height={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"/>
          <input value={query} onChange={e => { setQuery(e.target.value.toUpperCase()); setError(null) }}
            placeholder="Plate number — e.g. KA01AB1234"
            maxLength={12}
            className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-[13.5px] font-mono text-ink placeholder:text-ink-faint placeholder:font-sans focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-card uppercase"/>
        </div>
        <button type="submit" disabled={loading || !query.trim()}
          className="px-5 py-2.5 bg-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold rounded-xl transition-all hover:shadow-card-md active:scale-[0.98]">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Searching…</span> : 'Search'}
        </button>
      </form>

      {/* Recent searches */}
      {!searched && history.length > 0 && (
        <div className="mb-6">
          <div className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wider mb-2">Recent searches</div>
          <div className="flex flex-wrap gap-2">
            {history.map(p => (
              <button key={p} onClick={() => { setQuery(p); doSearch(p) }}
                className="font-mono text-[12px] bg-surface-card border border-surface-border hover:border-brand-border hover:bg-brand-muted text-ink-muted hover:text-brand px-3 py-1.5 rounded-xl transition-all shadow-card">
                {p}
              </button>
            ))}
            <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY) }}
              className="text-[11px] text-ink-faint hover:text-signal-red transition-colors px-2">clear</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searched && history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-muted border border-brand-border flex items-center justify-center mb-4 shadow-card">
            <IconSearch width={24} height={24} className="text-brand"/>
          </div>
          <p className="text-[14px] font-medium text-ink mb-1">Search by license plate</p>
          <p className="text-[12.5px] text-ink-muted max-w-xs">Enter a plate number to see the full detection history, camera timeline, and reconstructed movement path.</p>
          <div className="mt-4 text-[11.5px] text-ink-faint font-mono bg-surface-elevated border border-surface-border rounded-xl px-4 py-2">
            Try: KA01AB1234
          </div>
        </div>
      )}

      {error && (
        <div className="bg-signal-red-bg border border-signal-red-border rounded-xl px-5 py-3.5 text-[13px] text-signal-red mb-4 flex items-center gap-2">
          <span className="text-[15px]">⚠</span>{error}
        </div>
      )}

      {summary && trajectory && !loading && (
        <div className="grid grid-cols-3 gap-5 animate-riseIn">
          <div className="col-span-1 flex flex-col gap-4">
            {/* Summary card */}
            <Panel>
              <div className="px-5 py-5">
                <div className="text-[10.5px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">Plate Number</div>
                <div className="font-mono text-[24px] font-bold text-ink tracking-widest mb-4">{summary.plate_number}</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[['Detections', summary.detection_count], ['Cameras', summary.camera_count]].map(([l,v])=>(
                    <div key={String(l)} className="bg-surface-elevated border border-surface-border rounded-xl p-3 text-center">
                      <div className="font-mono text-[22px] font-bold text-ink">{v}</div>
                      <div className="text-[10.5px] text-ink-faint mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5 text-[12px]">
                  {[['First seen', summary.first_seen], ['Last seen', summary.last_seen]].map(([l,v])=>(
                    <div key={String(l)} className="flex items-center gap-2 py-2 border-t border-surface-border">
                      <IconClock width={12} height={12} className="text-ink-faint shrink-0"/>
                      <span className="text-ink-muted">{l}</span>
                      <span className="ml-auto font-mono text-ink text-[11.5px]">{formatDateTime(String(v))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Timeline */}
            <Panel title="Detection timeline">
              <div className="divide-y divide-surface-border max-h-72 overflow-y-auto">
                {trajectory.detections.map((d, i) => (
                  <div key={`${d.camera_id}-${i}`} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-elevated/50 transition-colors group">
                    <div className="relative flex flex-col items-center">
                      <div className="w-6 h-6 rounded-lg bg-brand-muted border border-brand-border flex items-center justify-center shrink-0 group-hover:bg-brand-border transition-colors">
                        <IconCamera width={11} height={11} className="text-brand"/>
                      </div>
                      {i < trajectory.detections.length - 1 && <div className="w-px h-full bg-surface-border absolute top-6 left-3"/>}
                    </div>
                    <div className="min-w-0 pb-1">
                      <div className="font-mono text-[12.5px] font-semibold text-ink">{d.camera_id}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">{formatDateTime(d.timestamp)}</div>
                      <div className="text-[10.5px] text-ink-faint">{d.direction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Map */}
          <Panel title="Reconstructed movement path" className="col-span-2 overflow-hidden">
            <div className="h-[560px]">
              <MapContainer center={path[0]??[12.9726,77.598]} zoom={13} style={{height:'100%',width:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
                {path.length > 1 && <Polyline positions={path} pathOptions={{color:'#1D4ED8',weight:3,opacity:0.85,dashArray:'7 9'}}/>}
                {trajectory.detections.map((d, i) => (
                  <Marker key={`${d.camera_id}-${i}`} position={[d.latitude,d.longitude]} icon={trajectoryIcon}>
                    <Popup>
                      <div className="font-mono text-xs font-bold text-brand">Stop {i+1} · {d.camera_id}</div>
                      <div className="text-xs text-ink-muted mt-1">{formatDateTime(d.timestamp)}</div>
                      <div className="text-xs text-ink-faint">{d.direction}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Panel>
        </div>
      )}
    </Shell>
  )
}
