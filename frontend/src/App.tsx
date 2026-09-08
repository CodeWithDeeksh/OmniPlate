import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { ToastProvider } from './lib/toast'
import { ShortcutProvider } from './lib/shortcuts'
import { SignIn } from './pages/SignIn'
import { Dashboard } from './pages/Dashboard'
import { applyRuntimeCSP } from './lib/security'

// Apply CSP at startup
applyRuntimeCSP()

const MapView      = lazy(() => import('./pages/MapView').then(m => ({ default: m.MapView })))
const VehicleSearch = lazy(() => import('./pages/VehicleSearch').then(m => ({ default: m.VehicleSearch })))
const Alerts       = lazy(() => import('./pages/Alerts').then(m => ({ default: m.Alerts })))
const Analytics    = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })))

function Spinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface">
      <div className="w-6 h-6 border-2 border-surface-border border-t-brand rounded-full animate-spin"/>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  if (!user) return <SignIn/>
  return (
    <ShortcutProvider>
      <Suspense fallback={<Spinner/>}>
        <Routes>
          <Route path="/"          element={<Dashboard/>}/>
          <Route path="/map"       element={<MapView/>}/>
          <Route path="/search"    element={<VehicleSearch/>}/>
          <Route path="/alerts"    element={<Alerts/>}/>
          <Route path="/analytics" element={<Analytics/>}/>
          <Route path="*"          element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </ShortcutProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes/>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
