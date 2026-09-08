import { useMemo, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Panel } from '../components/ui/Panel'
import { Badge, severityTone } from '../components/ui/Badge'
import { IconAlert, IconClock, IconCamera } from '../components/ui/Icons'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { formatDateTime, timeAgo } from '../lib/format'
import { useAuth } from '../lib/auth'
import { ROLE_PERMISSIONS } from '../lib/security'
import type { Alert } from '../lib/types'

const TYPE_LABELS: Record<string, string> = {
  BLACKLISTED_VEHICLE: 'Blacklisted vehicle',
  IMPOSSIBLE_TRAVEL:   'Impossible travel',
  ROUTE_ANOMALY:       'Route anomaly',
}

function AlertDrawer({ alert, canViewBlacklist, onClose }: { alert: Alert | null; canViewBlacklist: boolean; onClose: () => void }) {
  if (!alert) return null
  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-riseIn" onClick={onClose}>
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-card-lg animate-riseIn" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
              <span className="text-[11.5px] text-ink-faint">{timeAgo(alert.timestamp)}</span>
            </div>
            <div className="font-mono text-[20px] font-bold text-ink">{canViewBlacklist ? alert.plate_number : '••••••••'}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-border text-ink-muted hover:text-ink transition-colors text-[18px] leading-none">×</button>
        </div>

        <div className="bg-surface-elevated border border-surface-border rounded-xl p-4 mb-4">
          <p className="text-[13px] text-ink leading-relaxed">{alert.message}</p>
        </div>

        <div className="space-y-2.5 text-[12.5px]">
          {[
            ['Type', TYPE_LABELS[alert.type] ?? alert.type],
            ['Camera', alert.camera_id],
            ['Timestamp', formatDateTime(alert.timestamp)],
            ['Alert ID', alert.alert_id],
          ].map(([k,v])=>(
            <div key={k} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
              <span className="text-ink-muted">{k}</span>
              <span className="font-mono text-ink text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          {canViewBlacklist && (
            <a href={`#/search?plate=${alert.plate_number}`} onClick={onClose}
              className="flex-1 bg-brand text-white text-[13px] font-semibold py-2.5 rounded-xl text-center hover:bg-brand-light transition-colors">
              Track vehicle →
            </a>
          )}
          <button onClick={onClose} className="flex-1 bg-surface-elevated text-ink text-[13px] font-medium py-2.5 rounded-xl hover:bg-surface-border transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function Alerts() {
  const { user } = useAuth()
  const perms = user ? ROLE_PERMISSIONS[user.role] : null
  const { data: alerts, loading } = useAsync(() => api.getAlerts(), [], 10000)
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selected, setSelected] = useState<Alert | null>(null)

  const types = useMemo(() => Array.from(new Set((alerts??[]).map(a=>a.type))), [alerts])

  const filtered = useMemo(() => (alerts??[]).filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false
    return true
  }), [alerts, severityFilter, typeFilter])

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string,number> = { CRITICAL:0, HIGH:0, MEDIUM:0, LOW:0 }
    alerts?.forEach(a => { if (a.severity in c) c[a.severity]++ })
    return c
  }, [alerts])

  return (
    <Shell title="Alerts" subtitle="Blacklist matches, impossible travel, and route anomalies" alertCount={alerts?.length}>
      {/* Severity summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {(['CRITICAL','HIGH','MEDIUM','LOW'] as const).map(sev => (
          <button key={sev} onClick={() => setSeverityFilter(severityFilter===sev?'ALL':sev)}
            className={`bg-surface-card border rounded-2xl px-5 py-4 text-left transition-all shadow-card hover:-translate-y-0.5 hover:shadow-card-md ${severityFilter===sev?'border-brand ring-2 ring-brand/20':'border-surface-border'}`}>
            <Badge tone={severityTone(sev)}>{sev}</Badge>
            <div className="font-mono text-[28px] font-bold text-ink mt-2">{counts[sev]??0}</div>
            <div className="text-[11px] text-ink-faint">active alerts</div>
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11.5px] text-ink-muted font-medium">Filter by type:</span>
        {['ALL',...types].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all ${typeFilter===t?'bg-brand text-white border-brand shadow-card':'bg-surface-card text-ink-muted border-surface-border hover:border-brand-border hover:text-ink'}`}>
            {t==='ALL' ? 'All Types' : (TYPE_LABELS[t]??t)}
          </button>
        ))}
        {filtered.length !== (alerts?.length??0) && (
          <span className="ml-auto text-[11.5px] text-ink-faint">{filtered.length} of {alerts?.length} shown</span>
        )}
      </div>

      <Panel>
        {loading && <div className="py-12 text-center text-[12.5px] text-ink-faint">Loading alerts…</div>}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center mx-auto mb-3">
              <IconAlert width={20} height={20} className="text-ink-faint"/>
            </div>
            <p className="text-[13px] text-ink-muted">No alerts match this filter</p>
            <button onClick={()=>{setSeverityFilter('ALL');setTypeFilter('ALL')}} className="text-[12px] text-brand hover:underline mt-1.5">Clear filters</button>
          </div>
        )}
        <div className="divide-y divide-surface-border">
          {filtered.map(alert => (
            <div key={alert.alert_id} onClick={() => setSelected(alert)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-elevated/60 transition-colors cursor-pointer group">
              <div className="shrink-0"><Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge></div>
              <div className="min-w-[160px]">
                <div className="font-mono text-[13px] font-semibold text-ink">{perms?.canViewBlacklist ? alert.plate_number : '••••••••'}</div>
                <div className="text-[11px] text-ink-faint mt-0.5">{TYPE_LABELS[alert.type]??alert.type}</div>
              </div>
              <div className="flex-1 text-[12.5px] text-ink-muted truncate">{alert.message}</div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-ink-faint shrink-0">
                <IconCamera width={11} height={11}/>{alert.camera_id}
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-ink-faint w-28 justify-end shrink-0">
                <IconClock width={11} height={11}/>{timeAgo(alert.timestamp)}
              </div>
              <span className="text-[11px] text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0">View →</span>
            </div>
          ))}
        </div>
      </Panel>

      <AlertDrawer alert={selected} canViewBlacklist={!!perms?.canViewBlacklist} onClose={() => setSelected(null)} />
    </Shell>
  )
}
