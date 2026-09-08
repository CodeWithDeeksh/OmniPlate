import type { SVGProps } from 'react'

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const IconGrid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
)
export const IconMap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Z" /><path d="M9 3v15" /><path d="M15 6v15" /></svg>
)
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const IconAlert = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>
)
export const IconChart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" /></svg>
)
export const IconCamera = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 8h3l2-2h6l2 2h3v11H4V8Z" /><circle cx="12" cy="13.5" r="3.5" /></svg>
)
export const IconChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
)
export const IconDot = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 8 8" fill="currentColor" {...p}><circle cx="4" cy="4" r="4" /></svg>
)
export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
)
export const IconArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
)
export const IconArrowDownRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="m7 7 10 10" /><path d="M17 8v9H8" /></svg>
)
export const IconWifiOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M2 8.82a15 15 0 0 1 4.17-2.65" /><path d="M10.66 5a15 15 0 0 1 11.34 3.82" /><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" /><path d="M5 12.85a10 10 0 0 1 3.35-2.35" /><path d="M8.53 16.11a5 5 0 0 1 6.95 0" /><path d="M12 20h.01" /><path d="m2 2 20 20" /></svg>
)
