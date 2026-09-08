import clsx from 'clsx'

export type Tone = 'red' | 'orange' | 'amber' | 'green' | 'blue' | 'neutral'

const toneClasses: Record<Tone, string> = {
  red: 'bg-signal-red-bg text-signal-red border-signal-red-border',
  orange: 'bg-signal-orange-bg text-signal-orange border-signal-orange-border',
  amber: 'bg-signal-amber-bg text-signal-amber border-signal-amber-border',
  green: 'bg-signal-green-bg text-signal-green border-signal-green-border',
  blue: 'bg-signal-blue-bg text-signal-blue border-signal-blue-border',
  neutral: 'bg-surface-elevated text-ink-muted border-surface-border',
}

export function severityTone(severity: string): Tone {
  if (severity === 'CRITICAL') return 'red'
  if (severity === 'HIGH') return 'orange'
  if (severity === 'MEDIUM') return 'amber'
  if (severity === 'LOW') return 'green'
  return 'neutral'
}

export function congestionTone(level: string): Tone {
  if (level === 'HIGH') return 'red'
  if (level === 'MEDIUM') return 'amber'
  return 'green'
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-semibold font-mono tracking-tight', toneClasses[tone])}>
      {children}
    </span>
  )
}
