'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type State<T> = {
  data: T | null
  loading: boolean
  /** Non-null when the request failed. */
  error: string | null
  offline: boolean
  refetch: () => void
  /** True while a refetch runs over already-rendered data. */
  refreshing: boolean
}

/**
 * Fetch with the failure paths the portal was missing: every page used
 * `.then().then()` with no `.catch()`, so any non-2xx or network error left
 * `loading` true forever — a permanent "Loading…" screen.
 */
export function useFetch<T = unknown>(url: string | null, deps: unknown[] = []): State<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [nonce, setNonce] = useState(0)
  const hasData = useRef(false)

  const refetch = useCallback(() => setNonce(n => n + 1), [])

  useEffect(() => {
    if (!url) { setLoading(false); return }

    const ctrl = new AbortController()
    let alive = true

    if (hasData.current) setRefreshing(true)
    else setLoading(true)
    setError(null)
    setOffline(false)

    fetch(url, { signal: ctrl.signal })
      .then(async res => {
        // Explicitly reject non-2xx. Every page previously treated a 500 HTML
        // error page as valid JSON and then destructured it.
        if (!res.ok) {
          let message = `Request failed (${res.status})`
          try {
            const body = await res.json()
            if (body?.error) message = body.error
          } catch { /* non-JSON error body */ }
          throw new Error(message)
        }
        return res.json()
      })
      .then((json: T) => {
        if (!alive) return
        hasData.current = true
        setData(json)
      })
      .catch((err: unknown) => {
        if (!alive || (err instanceof DOMException && err.name === 'AbortError')) return
        setOffline(typeof navigator !== 'undefined' && navigator.onLine === false)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
        setRefreshing(false)
      })

    return () => { alive = false; ctrl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, nonce, ...deps])

  // Recover automatically when connectivity returns.
  useEffect(() => {
    const onOnline = () => { if (error) refetch() }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [error, refetch])

  return { data, loading, refreshing, error, offline, refetch }
}
