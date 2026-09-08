import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

export type UserRole = 'admin' | 'operator' | 'viewer'

export interface AuthUser {
  name: string
  role: UserRole
  badgeId: string
  department: string
}

export interface AuditEntry {
  action: string
  detail: string
  timestamp: string
  role?: string
}

interface AuthCtx {
  user: AuthUser | null
  login: (credentials: { username: string; password: string }) => { ok: boolean; error?: string }
  logout: () => void
  auditLog: AuditEntry[]
  sessionSecondsLeft: number
  resetSessionTimer: () => void
}

const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  admin:    { password: 'Admin@2024!',  user: { name: 'Ravi Kumar',   role: 'admin',    badgeId: 'IPS-2401', department: 'Traffic Intelligence Cell' } },
  operator: { password: 'Oper@2024!',  user: { name: 'Priya Sharma', role: 'operator', badgeId: 'TC-0892',  department: 'Control Room' } },
  viewer:   { password: 'View@2024!',  user: { name: 'Anil Singh',   role: 'viewer',   badgeId: 'OBS-0231', department: 'Analytics Wing' } },
}

const SESSION_KEY  = 'omniplate_session'
const AUDIT_KEY    = 'omniplate_audit'
const ATTEMPT_KEY  = 'omniplate_attempts'
const SESSION_TTL  = 30 * 60          // 30 min idle timeout in seconds
const MAX_ATTEMPTS = 3
const LOCKOUT_SECS = 30

const AuthContext = createContext<AuthCtx>({ user: null, login: () => ({ ok: false }), logout: () => {}, auditLog: [], sessionSecondsLeft: SESSION_TTL, resetSessionTimer: () => {} })

function addAudit(entry: AuditEntry) {
  try {
    const existing: AuditEntry[] = JSON.parse(sessionStorage.getItem(AUDIT_KEY) ?? '[]')
    existing.unshift(entry)
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(existing.slice(0, 100)))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') } catch { return null }
  })
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(AUDIT_KEY) ?? '[]') } catch { return [] }
  })
  const [secondsLeft, setSecondsLeft] = useState(SESSION_TTL)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetSessionTimer = useCallback(() => setSecondsLeft(SESSION_TTL), [])

  // Persist user
  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  // Idle session countdown
  useEffect(() => {
    if (!user) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { logout(); return SESSION_TTL }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [user])

  // Reset on user activity
  useEffect(() => {
    if (!user) return
    const reset = () => resetSessionTimer()
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    return () => { window.removeEventListener('mousemove', reset); window.removeEventListener('keydown', reset) }
  }, [user, resetSessionTimer])

  function login({ username, password }: { username: string; password: string }): { ok: boolean; error?: string } {
    // Check lockout
    try {
      const att = JSON.parse(localStorage.getItem(ATTEMPT_KEY) ?? '{"count":0,"until":0}')
      if (att.until > Date.now()) {
        const secs = Math.ceil((att.until - Date.now()) / 1000)
        return { ok: false, error: `Too many attempts. Try again in ${secs}s.` }
      }
    } catch {}

    const account = DEMO_ACCOUNTS[username.trim().toLowerCase()]
    if (!account || account.password !== password) {
      // Track failed attempts
      try {
        const att = JSON.parse(localStorage.getItem(ATTEMPT_KEY) ?? '{"count":0,"until":0}')
        const count = att.count + 1
        const until = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_SECS * 1000 : 0
        localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ count, until }))
        const remaining = MAX_ATTEMPTS - count
        const entry: AuditEntry = { action: 'LOGIN_FAILED', detail: `Failed login for "${username}"`, timestamp: new Date().toISOString() }
        addAudit(entry)
        setAuditLog(l => [entry, ...l])
        if (count >= MAX_ATTEMPTS) return { ok: false, error: `Account locked for ${LOCKOUT_SECS}s due to repeated failures.` }
        return { ok: false, error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }
      } catch {}
      return { ok: false, error: 'Invalid credentials.' }
    }

    localStorage.removeItem(ATTEMPT_KEY)
    setUser(account.user)
    resetSessionTimer()
    const entry: AuditEntry = { action: 'LOGIN', detail: `Signed in as ${account.user.name}`, timestamp: new Date().toISOString(), role: account.user.role }
    addAudit(entry)
    setAuditLog(l => [entry, ...l])
    return { ok: true }
  }

  function logout() {
    if (user) {
      const entry: AuditEntry = { action: 'LOGOUT', detail: `${user.name} signed out`, timestamp: new Date().toISOString(), role: user.role }
      addAudit(entry)
      setAuditLog(l => [entry, ...l])
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, auditLog, sessionSecondsLeft: secondsLeft, resetSessionTimer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
