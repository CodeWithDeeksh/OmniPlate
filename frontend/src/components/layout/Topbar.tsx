import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useShortcuts } from '../../lib/shortcuts'

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, sessionSecondsLeft } = useAuth()
  const { openPalette } = useShortcuts()
  const [now, setNow] = useState(new Date())

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const time = now.toLocaleTimeString('en-IN', { hour12: false })
  const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const sessionWarning = sessionSecondsLeft <= 120

  return (
    <header className="h-14 shrink-0 border-b border-surface-border bg-surface-card/95 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-ink leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-ink-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Cmd+K button */}
        <button onClick={openPalette} className="hidden md:flex items-center gap-2 bg-surface-elevated border border-surface-border rounded-xl px-3 py-1.5 text-[12px] text-ink-muted hover:border-brand-border hover:text-ink transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>Quick search</span>
          <kbd className="text-[10px] border border-surface-border rounded px-1 font-mono">⌘K</kbd>
        </button>

        {/* Session countdown warning */}
        {sessionWarning && user && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-signal-amber bg-signal-amber-bg border border-signal-amber-border rounded-lg px-2.5 py-1 animate-pulseDot">
            ⚠ {Math.floor(sessionSecondsLeft/60)}:{String(sessionSecondsLeft%60).padStart(2,'0')}
          </div>
        )}

        {!sessionWarning && user && (
          <div className="hidden sm:flex items-center gap-1.5 bg-signal-green-bg border border-signal-green-border text-signal-green text-[11px] font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulseDot" />
            Live
          </div>
        )}

        <div className="text-right">
          <div className="text-[12.5px] font-mono font-medium text-ink tabular-nums">{time} IST</div>
          <div className="text-[10px] text-ink-muted">{date}</div>
        </div>
      </div>
    </header>
  )
}
