import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}) {
  return (
    <div className={clsx('bg-surface-card border border-surface-border rounded-2xl shadow-card', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-[13.5px] font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
