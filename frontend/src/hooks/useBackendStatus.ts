import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function useBackendStatus(intervalMs = 15000) {
  const [reachable, setReachable] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const ok = await api.health()
      if (!cancelled) setReachable(ok)
    }

    check()
    const id = setInterval(check, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return reachable
}
