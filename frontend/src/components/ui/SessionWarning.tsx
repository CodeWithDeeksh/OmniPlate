import { useAuth } from '../../lib/auth'

export function SessionWarning() {
  const { sessionSecondsLeft, resetSessionTimer, logout } = useAuth()
  if (sessionSecondsLeft > 120) return null
  const mins = Math.floor(sessionSecondsLeft / 60)
  const secs = sessionSecondsLeft % 60
  const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9990] bg-signal-amber-bg border border-signal-amber-border text-signal-amber rounded-2xl px-5 py-3 shadow-card-lg flex items-center gap-4 animate-riseIn">
      <span className="text-[13px] font-medium">⚠ Session expires in <strong className="font-mono">{label}</strong></span>
      <button onClick={resetSessionTimer} className="text-[12px] font-semibold underline hover:no-underline">Stay logged in</button>
      <button onClick={logout} className="text-[12px] opacity-70 hover:opacity-100">Sign out</button>
    </div>
  )
}
