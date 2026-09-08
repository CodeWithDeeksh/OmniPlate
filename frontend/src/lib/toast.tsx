import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
}

interface ToastCtx {
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastCtx>({ toasts: [], addToast: () => {}, removeToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [{ ...t, id }, ...prev].slice(0, 5))
    setTimeout(() => removeToast(id), 5000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }

const icons: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
const colors: Record<ToastType, string> = {
  success: 'bg-signal-green-bg border-signal-green-border text-signal-green',
  error:   'bg-signal-red-bg border-signal-red-border text-signal-red',
  warning: 'bg-signal-amber-bg border-signal-amber-border text-signal-amber',
  info:    'bg-signal-blue-bg border-signal-blue-border text-signal-blue',
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card-lg backdrop-blur-sm max-w-sm animate-riseIn ${colors[t.type]}`}>
          <span className="text-[14px] font-bold shrink-0 mt-0.5">{icons[t.type]}</span>
          <div className="flex-1 min-w-0">
            {t.title && <div className="text-[12.5px] font-semibold">{t.title}</div>}
            <div className="text-[12px] leading-relaxed opacity-90">{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} className="text-[16px] opacity-50 hover:opacity-100 shrink-0 leading-none">×</button>
        </div>
      ))}
    </div>
  )
}
