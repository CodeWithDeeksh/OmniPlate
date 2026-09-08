import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function useAlertCount(intervalMs = 20000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const alerts = await api.getAlerts()
      if (!cancelled) setCount(alerts.length)
    }

    load()
    const id = setInterval(load, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return count
}
