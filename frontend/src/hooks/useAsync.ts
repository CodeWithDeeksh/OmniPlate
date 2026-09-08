import { useEffect, useState, useCallback } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = [], intervalMs?: number) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fn()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    const cleanup = run()
    if (!intervalMs) return cleanup
    const id = setInterval(run, intervalMs)
    return () => {
      cleanup()
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, intervalMs])

  return { data, loading, error, refetch: run }
}
