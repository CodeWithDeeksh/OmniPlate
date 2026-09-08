import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SessionWarning } from '../ui/SessionWarning'
import { CommandPalette } from '../ui/CommandPalette'

export function Shell({ title, subtitle, children, noPadding, alertCount }:
  { title: string; subtitle?: string; children: ReactNode; noPadding?: boolean; alertCount?: number }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar alertCount={alertCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className={noPadding ? 'flex-1 min-h-0' : 'flex-1 min-h-0 overflow-y-auto px-6 py-5'}>
          {children}
        </main>
      </div>
      <SessionWarning />
      <CommandPalette />
    </div>
  )
}
