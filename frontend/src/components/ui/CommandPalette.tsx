import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShortcuts } from '../../lib/shortcuts'
import { normalizePlate } from '../../lib/security'

const NAV_ITEMS = [
  { label: 'Command Center', path: '/', hint: 'G D' },
  { label: 'Live Map', path: '/map', hint: 'G M' },
  { label: 'Vehicle Search', path: '/search', hint: 'G S' },
  { label: 'Alerts', path: '/alerts', hint: 'G A' },
  { label: 'Analytics', path: '/analytics', hint: 'G N' },
]

export function CommandPalette() {
  const { paletteOpen, closePalette } = useShortcuts()
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (paletteOpen) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50) } }, [paletteOpen])

  if (!paletteOpen) return null

  const isPlate = /^[A-Z]{2}/i.test(q.trim())
  const filtered = q ? NAV_ITEMS.filter(n => n.label.toLowerCase().includes(q.toLowerCase())) : NAV_ITEMS

  function goTo(path: string) { navigate(path); closePalette() }
  function searchPlate() {
    if (!q.trim()) return
    navigate(`/search?plate=${encodeURIComponent(normalizePlate(q))}`)
    closePalette()
  }

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9998] flex items-start justify-center pt-24 px-4 animate-riseIn" onClick={closePalette}>
      <div className="bg-surface-card border border-surface-border rounded-2xl shadow-card-lg w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
          <span className="text-ink-faint text-[15px]">⌘</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && isPlate) searchPlate(); if (e.key === 'Enter' && filtered[0]) goTo(filtered[0].path) }}
            placeholder="Search pages or plate number…"
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none" />
          <kbd className="text-[10px] text-ink-faint border border-surface-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="py-2 max-h-72 overflow-y-auto">
          {isPlate && q.length >= 4 && (
            <button onClick={searchPlate} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-elevated text-left transition-colors">
              <span className="text-brand font-mono font-semibold text-[13px]">{q.toUpperCase()}</span>
              <span className="text-[12px] text-ink-muted">Search vehicle →</span>
            </button>
          )}
          {filtered.map(item => (
            <button key={item.path} onClick={() => goTo(item.path)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-elevated text-left transition-colors">
              <span className="text-[13.5px] text-ink">{item.label}</span>
              <kbd className="text-[10px] text-ink-faint border border-surface-border rounded px-1.5 py-0.5 font-mono">{item.hint}</kbd>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-surface-border flex gap-4">
          <span className="text-[10.5px] text-ink-faint"><kbd className="border border-surface-border rounded px-1 font-mono">↑↓</kbd> navigate</span>
          <span className="text-[10.5px] text-ink-faint"><kbd className="border border-surface-border rounded px-1 font-mono">↵</kbd> select</span>
          <span className="text-[10.5px] text-ink-faint"><kbd className="border border-surface-border rounded px-1 font-mono">?</kbd> shortcuts</span>
        </div>
      </div>
    </div>
  )
}
