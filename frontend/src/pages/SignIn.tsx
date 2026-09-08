import { useState, useRef } from 'react'
import { useAuth } from '../lib/auth'

const ROLES = [
  { value: 'admin',    label: 'Administrator', desc: 'Full access · audit log · export' },
  { value: 'operator', label: 'Operator',       desc: 'Monitor · search · alerts' },
  { value: 'viewer',   label: 'Analyst',         desc: 'Analytics & reports only' },
] as const

const HINTS = {
  admin:    { user: 'admin',    pass: 'Admin@2024!' },
  operator: { user: 'operator', pass: 'Oper@2024!' },
  viewer:   { user: 'viewer',   pass: 'View@2024!' },
}

export function SignIn() {
  const { login } = useAuth()
  const [role, setRole] = useState<'admin'|'operator'|'viewer'>('operator')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const passRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    setTimeout(() => {
      const result = login({ username: username.trim(), password })
      if (!result.ok) setError(result.error ?? 'Invalid credentials.')
      setLoading(false)
    }, 600)
  }

  function applyHint() {
    const h = HINTS[role]
    setUsername(h.user); setPassword(h.pass); setError('')
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[52%] bg-surface-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-card-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div className="text-white font-bold text-[15px]">OmniPlate AI</div>
            <div className="text-ink-sidebar-muted text-[10.5px] font-mono tracking-wider">SIH 2024 · SIH26127</div>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-signal-green/15 border border-signal-green/30 text-signal-green text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulseDot"/>
            All systems operational · 8 cameras live
          </div>
          <h1 className="text-white text-[40px] font-bold leading-[1.1] tracking-tight mb-4">
            City-wide Vehicle<br/>Intelligence<br/>Platform
          </h1>
          <p className="text-ink-sidebar text-[14px] leading-relaxed max-w-sm">
            Real-time ANPR surveillance, trajectory reconstruction, anomaly detection, and traffic analytics — across Bengaluru's camera network.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[['8','Cameras Online'],['24,813','Detections Today'],['5','Active Alerts'],['99.4%','System Uptime']].map(([v,l])=>(
              <div key={l} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-4 transition-colors">
                <div className="text-[22px] font-bold text-white font-mono">{v}</div>
                <div className="text-[11px] text-ink-sidebar mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-ink-sidebar-muted">
          Govt. of Karnataka · Traffic Intelligence Division · <span className="text-signal-red font-medium">CONFIDENTIAL</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-surface">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div className="text-ink font-bold text-[14px]">OmniPlate AI</div>
              <div className="text-ink-faint text-[10.5px] font-mono">SIH26127</div>
            </div>
          </div>

          <h2 className="text-[28px] font-bold text-ink mb-1 tracking-tight">Sign in</h2>
          <p className="text-ink-muted text-[13.5px] mb-7">Restricted to authorised personnel only.</p>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wider mb-2.5 block">Access Level</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  onClick={() => { setRole(r.value); setError('') }}
                  className={`p-3 rounded-xl border text-left transition-all ${role===r.value ? 'border-brand bg-brand-muted shadow-[0_0_0_1px_#BFDBFE]' : 'border-surface-border bg-surface-card hover:border-brand-border hover:bg-surface-elevated'}`}>
                  <div className={`text-[12px] font-semibold ${role===r.value?'text-brand':'text-ink'}`}>{r.label}</div>
                  <div className="text-[10px] text-ink-faint mt-0.5 leading-snug">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11.5px] font-semibold text-ink-muted mb-1.5 block">Username</label>
              <input value={username} onChange={e=>{setUsername(e.target.value);setError('')}}
                placeholder={`e.g. ${HINTS[role].user}`} autoComplete="username"
                className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"/>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-ink-muted mb-1.5 block">Password</label>
              <div className="relative">
                <input ref={passRef} type={showPass?'text':'password'} value={password}
                  onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-surface-card border border-surface-border rounded-xl px-3.5 py-2.5 pr-10 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"/>
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors text-[11px]">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-signal-red-bg border border-signal-red-border rounded-xl px-3.5 py-3">
                <span className="text-signal-red text-[14px] shrink-0">⚠</span>
                <p className="text-[12.5px] text-signal-red">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading||!username||!password}
              className="w-full bg-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-[14px] transition-all hover:shadow-card-md active:scale-[0.99]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Verifying…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 bg-surface-elevated border border-surface-border rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Demo credentials</span>
              <button onClick={applyHint} className="text-[11px] text-brand font-semibold hover:underline">Auto-fill →</button>
            </div>
            <div className="font-mono text-[12px] text-ink bg-surface-card border border-surface-border rounded-lg px-3 py-2">
              {HINTS[role].user} / {HINTS[role].pass}
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-ink-faint leading-relaxed">
            Unauthorised access is a criminal offence<br/>under IT Act 2000 §66. All sessions are logged.
          </p>
        </div>
      </div>
    </div>
  )
}
