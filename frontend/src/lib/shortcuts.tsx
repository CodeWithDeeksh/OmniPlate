import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ShortcutCtx { paletteOpen: boolean; openPalette: () => void; closePalette: () => void }
const ShortcutContext = createContext<ShortcutCtx>({ paletteOpen: false, openPalette: () => {}, closePalette: () => {} })

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let gPressed = false
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA'
      // Cmd/Ctrl+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p); return }
      // Escape → close palette
      if (e.key === 'Escape') { setPaletteOpen(false); return }
      if (inInput) return
      // G+key nav
      if (e.key === 'g') { gPressed = true; setTimeout(() => { gPressed = false }, 1000); return }
      if (gPressed) {
        if (e.key === 'd') navigate('/')
        if (e.key === 'm') navigate('/map')
        if (e.key === 's') navigate('/search')
        if (e.key === 'a') navigate('/alerts')
        if (e.key === 'n') navigate('/analytics')
        gPressed = false
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return (
    <ShortcutContext.Provider value={{ paletteOpen, openPalette: () => setPaletteOpen(true), closePalette: () => setPaletteOpen(false) }}>
      {children}
    </ShortcutContext.Provider>
  )
}

export function useShortcuts() { return useContext(ShortcutContext) }
