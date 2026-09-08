import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Shell } from '../components/layout/Shell'
import { Panel } from '../components/ui/Panel'
import { StatCard } from '../components/ui/StatCard'
import { Badge, severityTone } from '../components/ui/Badge'
import { IconCamera, IconAlert, IconChart, IconChevronRight, IconClock } from '../components/ui/Icons'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { recentDetections } from '../lib/mockData'
import { MiniMap } from '../components/map/MiniMap'
import { timeAgo } from '../lib/format'
import { useToast } from '../lib/toast'
import { useAuth } from '../lib/auth'
import { ROLE_PERMISSIONS } from '../lib/security'

// Live detection ticker
function DetectionTicker() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const tickers = [
    'KA01AB1234 · CAM_01 · Car · 94%',
    'MH12XY5678 · CAM_04 · Truck · 88%',
    'KA09EF9012 · CAM_12 · Motorcycle · 91%',
    'KA02GH3456 · CAM_02 · Car · 97%',
    'KA11IJ7890 · CAM_21 · Bus · 85%',
    'TN09AB1111 · CAM_07 · Van · 79%',
    'KA51MN4321 · CAM_17 · Car · 93%',
  ]
  const text = tickers.join('   ·   ') + '   ·   ' + tickers.join('   ·   ')
  return (
    <div className="bg-surface-sidebar border-b border-white/10 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 bg-brand text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulseDot" />LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={tickerRef} className="font-mono text-[11px] text-ink-sidebar whitespace-nowrap py-1.5 px-4"
            style={{ animation: 'tickerScroll 40s linear infinite' }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const perms = user ? ROLE_PERMISSIONS[user.role] : null
  const { addToast } = useToast()
  const { data: cameras } = useAsync(() => api.getCameras(), [], 30000)
  const { data: density } = useAsync(() => api.getDensity(), [], 15000)
  const { data: alerts } = useAsync(() => api.getAlerts(), [], 10000)
  const { data: congestion } = useAsync(() => api.getCongestion(), [], 15000)
  const prevAlertCount = useRef(0)

  const totalVph = density?.reduce((sum, d) => sum + d.vehicles_per_hour, 0) ?? 0
  const highCongestion = congestion?.filter(c => c.congestion_level === 'HIGH').length ?? 0
  const alertCount = alerts?.length ?? 0

  // Toast on new HIGH alerts
  useEffect(() => {
    if (alerts && alerts.length > prevAlertCount.current && prevAlertCount.current > 0) {
      const newAlert = alerts[0]
      if (['HIGH','CRITICAL'].includes(newAlert.severity)) {
        addToast({ type: 'error', title: '🚨 New High Alert', message: `${newAlert.plate_number} — ${newAlert.message}` })
      }
    }
    prevAlertCount.current = alerts?.length ?? 0
  }, [alerts, addToast])

  return (
    <Shell title="Command Center" subtitle="City-wide vehicle movement overview" alertCount={alertCount}>
      {/* Live ticker */}
      <div className="-mx-6 -mt-5 mb-5"><DetectionTicker /></div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Vehicles / hour" value={totalVph} icon={<IconChart width={11} height={11}/>} accent="blue" trend="up" trendLabel="+6.2% vs yesterday" />
        <StatCard label="Active cameras" value={cameras?.length ?? 0} unit={`of ${cameras?.length ?? 0}`} icon={<IconCamera width={11} height={11}/>} accent="green" />
        <StatCard label="Active alerts" value={alertCount} icon={<IconAlert width={11} height={11}/>} accent="red" trend={alertCount > 2 ? 'up' : 'flat'} trendLabel="Last 24h" />
        <StatCard label="Congested corridors" value={highCongestion} unit="high" icon={<IconChart width={11} height={11}/>} accent="amber" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-5">
          <Panel title="Live camera map"
            action={<Link to="/map" className="flex items-center gap-1 text-[12px] text-brand hover:underline">Full map <IconChevronRight width={12} height={12}/></Link>}
            className="overflow-hidden">
            <div className="h-64"><MiniMap cameras={cameras ?? []} /></div>
          </Panel>

          <Panel title="Recent detections"
            action={<span className="flex items-center gap-1.5 text-[11px] text-signal-green font-medium"><span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulseDot"/>Live feed</span>}>
            <div className="divide-y divide-surface-border">
              {recentDetections.map((d) => (
                <div key={d.plate} className="flex items-center justify-between px-5 py-3 hover:bg-surface-elevated/60 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-muted flex items-center justify-center group-hover:bg-brand-border transition-colors">
                      <IconCamera width={13} height={13} className="text-brand" />
                    </div>
                    <div>
                      <div className="font-mono text-[13px] font-semibold text-ink tracking-wide">{d.plate}</div>
                      <div className="text-[11px] text-ink-muted">{d.camera}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] capitalize bg-surface-elevated border border-surface-border text-ink-muted px-2 py-0.5 rounded-lg">{d.vehicle}</span>
                    <span className="text-[11px] font-mono text-ink-faint w-9 text-right">{(d.confidence*100).toFixed(0)}%</span>
                    <span className="text-[11px] text-ink-faint w-16 text-right">{d.time}</span>
                    {perms?.canSearchVehicle && (
                      <Link to={`/search?plate=${d.plate}`} className="text-[10.5px] text-brand opacity-0 group-hover:opacity-100 transition-opacity hover:underline">Track →</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Active alerts"
            action={<Link to="/alerts" className="flex items-center gap-1 text-[12px] text-brand hover:underline">View all <IconChevronRight width={12} height={12}/></Link>}>
            <div className="divide-y divide-surface-border">
              {(alerts ?? []).slice(0, 5).map(alert => (
                <div key={alert.alert_id} className="px-4 py-3 hover:bg-surface-elevated/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                    <span className="text-[10.5px] text-ink-faint flex items-center gap-1"><IconClock width={10} height={10}/>{timeAgo(alert.timestamp)}</span>
                  </div>
                  <div className="font-mono text-[12.5px] font-semibold text-ink">{perms?.canViewBlacklist ? alert.plate_number : '••••••••'}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5 leading-snug">{alert.message}</div>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && <div className="px-5 py-8 text-center text-[12px] text-ink-faint">No active alerts</div>}
            </div>
          </Panel>

          <Panel title="Corridor congestion">
            <div className="divide-y divide-surface-border">
              {(congestion ?? []).map(c => {
                const pct = Math.round(((c.travel_time_minutes - c.normal_travel_time_minutes)/c.normal_travel_time_minutes)*100)
                return (
                  <div key={`${c.from_camera}-${c.to_camera}`} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[12px] font-medium text-ink">{c.from_camera} → {c.to_camera}</span>
                      <Badge tone={severityTone(c.congestion_level)}>{c.congestion_level}</Badge>
                    </div>
                    <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, (c.travel_time_minutes/(c.normal_travel_time_minutes*2))*100)}%`,
                        background: c.congestion_level==='HIGH'?'#EF4444':c.congestion_level==='MEDIUM'?'#F59E0B':'#10B981'
                      }}/>
                    </div>
                    <div className="text-[10.5px] text-ink-faint mt-1">{c.travel_time_minutes}m actual · {pct>0?'+':''}{pct}% vs normal</div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}
