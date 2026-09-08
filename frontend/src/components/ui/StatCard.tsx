import type { ReactNode } from 'react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

const styles = {
  blue:  { bar: 'bg-brand',         pill: 'bg-brand-muted text-brand',                      glow: 'shadow-[0_0_0_1px_#BFDBFE]' },
  green: { bar: 'bg-signal-green',  pill: 'bg-signal-green-bg text-signal-green',            glow: 'shadow-[0_0_0_1px_#A7F3D0]' },
  red:   { bar: 'bg-signal-red',    pill: 'bg-signal-red-bg text-signal-red',                glow: 'shadow-[0_0_0_1px_#FECACA]' },
  amber: { bar: 'bg-signal-amber',  pill: 'bg-signal-amber-bg text-signal-amber',            glow: 'shadow-[0_0_0_1px_#FDE68A]' },
}

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current; const end = target
    const steps = 30; const step = (end - start) / steps; let i = 0
    const id = setInterval(() => {
      i++; setVal(Math.round(start + step * i))
      if (i >= steps) { setVal(end); clearInterval(id); prev.current = end }
    }, duration / steps)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

export function StatCard({ label, value, unit, trend, trendLabel, icon, accent = 'blue' }:
  { label: string; value: string | number; unit?: string; trend?: 'up' | 'down' | 'flat'; trendLabel?: string; icon?: ReactNode; accent?: 'blue' | 'green' | 'red' | 'amber' }) {
  const s = styles[accent]
  const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g,''))
  const animated = useCountUp(isNaN(numVal) ? 0 : numVal)
  const displayVal = isNaN(numVal) ? value : animated.toLocaleString('en-IN')

  return (
    <div className={clsx('relative bg-surface-card border border-surface-border rounded-2xl px-5 py-4 flex flex-col gap-2.5 shadow-card overflow-hidden hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 cursor-default', s.glow)}>
      <span className={clsx('absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full', s.bar)} />
      <div className="flex items-center justify-between">
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold', s.pill)}>{icon}{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[30px] font-bold font-mono tracking-tight leading-none text-ink">{displayVal}</span>
        {unit && <span className="text-[12px] text-ink-faint">{unit}</span>}
      </div>
      {trend && trendLabel && (
        <div className={clsx('text-[11.5px] font-mono', trend === 'up' ? 'text-signal-red' : trend === 'down' ? 'text-signal-green' : 'text-ink-faint')}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'} {trendLabel}
        </div>
      )}
    </div>
  )
}
