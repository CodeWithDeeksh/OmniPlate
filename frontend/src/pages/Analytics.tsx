import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import { Shell } from '../components/layout/Shell'
import { Panel } from '../components/ui/Panel'
import { Badge, severityTone } from '../components/ui/Badge'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'

const TT = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12, color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

// Traffic trend mock — from friend's TrafficTrendRecord idea
const TREND_DATA = [
  { time: '06:00', count: 420 }, { time: '07:00', count: 890 },
  { time: '08:00', count: 1540 }, { time: '09:00', count: 1340 },
  { time: '10:00', count: 980 }, { time: '11:00', count: 760 },
  { time: '12:00', count: 920 }, { time: '13:00', count: 850 },
  { time: '14:00', count: 780 }, { time: '15:00', count: 1010 },
  { time: '16:00', count: 1380 }, { time: '17:00', count: 1620 },
  { time: '18:00', count: 1240 }, { time: '19:00', count: 890 },
  { time: '20:00', count: 520 },
]

export function Analytics() {
  const { data: density } = useAsync(() => api.getDensity(), [], 20000)
  const { data: congestion } = useAsync(() => api.getCongestion(), [], 20000)
  const { data: od } = useAsync(() => api.getOD(), [], 20000)

  const densityData = (density ?? []).slice().sort((a, b) => b.vehicles_per_hour - a.vehicles_per_hour)
    .map((d) => ({ road: d.road, vph: d.vehicles_per_hour }))

  const odData = (od ?? []).map((o) => ({ flow: `${o.origin_zone}→${o.destination_zone}`, count: o.vehicle_count }))

  return (
    <Shell title="Analytics" subtitle="Traffic density, congestion patterns, and movement flows">
      {/* Hourly traffic trend — from friend's TrafficTrendRecord */}
      <Panel title="Hourly traffic volume (today)" action={<span className="text-[11.5px] text-ink-faint">All cameras combined</span>} className="mb-5">
        <div className="px-5 py-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND_DATA} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#E2E8F0" />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#E2E8F0" />
              <Tooltip contentStyle={TT} cursor={{ stroke: '#BFDBFE', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="count" stroke="#1D4ED8" strokeWidth={2.5} dot={false} name="Vehicles" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Panel title="Traffic density by road">
          <div className="px-5 py-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={densityData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#E2E8F0" />
                <YAxis type="category" dataKey="road" tick={{ fill: '#475569', fontSize: 11.5 }} stroke="#E2E8F0" width={110} />
                <Tooltip contentStyle={TT} cursor={{ fill: '#EFF6FF' }} />
                <Bar dataKey="vph" fill="#1D4ED8" radius={[0, 4, 4, 0]} name="Vehicles/hour" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Origin–destination flows">
          <div className="px-5 py-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={odData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="flow" tick={{ fill: '#94A3B8', fontSize: 10 }} stroke="#E2E8F0" angle={-20} textAnchor="end" height={55} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} stroke="#E2E8F0" />
                <Tooltip contentStyle={TT} cursor={{ fill: '#ECFDF5' }} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Vehicles" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Corridor congestion detail">
        <div className="divide-y divide-surface-border">
          {(congestion ?? []).map((c) => {
            const delta = c.travel_time_minutes - c.normal_travel_time_minutes
            const pct = Math.round((delta / c.normal_travel_time_minutes) * 100)
            return (
              <div key={`${c.from_camera}-${c.to_camera}`} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-[13px] font-semibold text-ink">{c.from_camera} → {c.to_camera}</div>
                  <Badge tone={severityTone(c.congestion_level)}>{c.congestion_level}</Badge>
                </div>
                <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, (c.travel_time_minutes / (c.normal_travel_time_minutes * 2)) * 100)}%`,
                    background: c.congestion_level === 'HIGH' ? '#EF4444' : c.congestion_level === 'MEDIUM' ? '#F59E0B' : '#10B981',
                  }} />
                </div>
                <div className="text-[11.5px] text-ink-faint">{c.travel_time_minutes}m actual vs {c.normal_travel_time_minutes}m normal ({pct > 0 ? '+' : ''}{pct}%)</div>
              </div>
            )
          })}
        </div>
      </Panel>
    </Shell>
  )
}
