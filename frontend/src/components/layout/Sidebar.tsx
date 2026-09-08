import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useShortcuts } from '../../lib/shortcuts'
import { ROLE_PERMISSIONS } from '../../lib/security'
import { IconGrid, IconMap, IconSearch, IconAlert, IconChart, IconCamera } from '../ui/Icons'

const navItems = [
  { to: '/', label: 'Command Center', icon: IconGrid, hint: 'G D', end: true },
  { to: '/map',       label: 'Live Map',       icon: IconMap,    hint: 'G M' },
  { to: '/search',    label: 'Vehicle Search', icon: IconSearch, hint: 'G S' },
  { to: '/alerts',    label: 'Alerts',         icon: IconAlert,  hint: 'G A', badge: true },
  { to: '/analytics', label: 'Analytics',      icon: IconChart,  hint: 'G N' },
]

const roleColor: Record<string, string> = {
  admin:    'bg-signal-red/20 text-signal-red border border-signal-red/30',
  operator: 'bg-brand/20 text-brand-light border border-brand/30',
  viewer:   'bg-signal-green/20 text-signal-green border border-signal-green/30',
}

export function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  const { user, logout, auditLog } = useAuth()
  const { openPalette } = useShortcuts()
  const [collapsed, setCollapsed] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const perms = user ? ROLE_PERMISSIONS[user.role] : null

  return (
    <>
      <aside className={`${collapsed ? 'w-16' : 'w-64'} shrink-0 h-full bg-surface-sidebar flex flex-col transition-all duration-200`}>
        {/* Logo + collapse */}
        <div className={`px-4 pt-5 pb-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div className="text-white font-semibold text-[13.5px]">OmniPlate AI</div>
                <div className="text-ink-sidebar-muted text-[10px] font-mono">SIH26127</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="text-ink-sidebar-muted hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" title="Collapse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="absolute left-16 top-5 bg-surface-sidebar border border-white/10 rounded-full w-5 h-5 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10" title="Expand">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* Cmd+K trigger */}
        {!collapsed && (
          <div className="px-3 mb-3">
            <button onClick={openPalette} className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[12px] text-ink-sidebar-muted transition-colors group">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span className="flex-1 text-left">Search or navigate…</span>
              <kbd className="text-[9.5px] border border-white/20 rounded px-1 py-0.5 font-mono opacity-60">⌘K</kbd>
            </button>
          </div>
        )}

        {!collapsed && <div className="px-4 mb-1.5"><span className="text-[9.5px] font-semibold text-ink-sidebar-muted uppercase tracking-widest">Navigation</span></div>}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all relative ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-brand text-white' : 'text-ink-sidebar hover:bg-white/10 hover:text-white'}`}
              title={collapsed ? item.label : undefined}>
              {({ isActive }) => (<>
                <item.icon width={16} height={16} className={isActive ? 'text-white shrink-0' : 'text-ink-sidebar-muted group-hover:text-white shrink-0'} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && alertCount > 0 && (
                  <span className="text-[10px] font-bold bg-signal-red text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{alertCount}</span>
                )}
                {!collapsed && <kbd className="text-[9px] text-ink-sidebar-muted opacity-0 group-hover:opacity-60 border border-white/10 rounded px-1 font-mono transition-opacity">{item.hint}</kbd>}
                {collapsed && item.badge && alertCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-signal-red" />
                )}
              </>)}
            </NavLink>
          ))}
        </nav>

        {/* Camera status */}
        {!collapsed && (
          <div className="mx-3 mb-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1.5">
              <IconCamera width={12} height={12} className="text-ink-sidebar-muted" />
              <span className="text-[10.5px] text-ink-sidebar-muted font-medium">Camera Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-green animate-pulseDot" />
              <span className="text-[12px] text-white">8 of 8 online</span>
            </div>
          </div>
        )}

        {/* Audit log (admin only) */}
        {!collapsed && perms?.canViewAudit && (
          <div className="mx-3 mb-2">
            <button onClick={() => setShowAudit(s => !s)} className="w-full text-left text-[10.5px] text-ink-sidebar-muted hover:text-white px-2 py-1.5 flex items-center gap-1.5 transition-colors">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Audit log ({auditLog.length})
            </button>
            {showAudit && (
              <div className="bg-black/30 rounded-xl p-2 max-h-36 overflow-y-auto mt-1">
                {auditLog.slice(0, 20).map((e, i) => (
                  <div key={i} className="text-[9.5px] font-mono text-ink-sidebar-muted py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-white/50">{new Date(e.timestamp).toLocaleTimeString('en-IN')}</span>
                    {' '}<span className={e.action === 'LOGIN_FAILED' ? 'text-signal-red' : 'text-signal-green'}>{e.action}</span>
                    {' '}<span className="truncate">{e.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User */}
        {user && (
          <div className={`p-3 ${collapsed ? 'mx-2' : 'mx-3'} mb-3 bg-white/5 rounded-xl border border-white/10`}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-[11px] font-bold">{user.name.charAt(0)}</div>
                <button onClick={logout} className="text-[8px] text-ink-sidebar-muted hover:text-white transition-colors">out</button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-[11px] font-bold shrink-0">{user.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-white truncate">{user.name}</div>
                    <div className="text-[9.5px] font-mono text-ink-sidebar-muted">{user.badgeId} · {user.department}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg ${roleColor[user.role]}`}>{user.role.toUpperCase()}</span>
                  <button onClick={logout} className="text-[10.5px] text-ink-sidebar-muted hover:text-signal-red transition-colors">Sign out</button>
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
