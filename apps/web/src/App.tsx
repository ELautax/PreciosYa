import { useEffect, useState } from 'react'

import { env } from '@/config/env'

type HealthResponse = {
  status: 'ok'
  timestamp: string
  version: string
}

export default function App() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setError(null)
        const res = await fetch(`${env.VITE_API_URL}/health`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: unknown = await res.json()
        if (cancelled) return
        setData(json as HealthResponse)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">PreciosYa</h1>
        <p className="mt-2 text-sm text-stone-600">
          Walking Skeleton: frontend ↔ backend health check
        </p>

        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-xs font-medium text-stone-500">
            GET {env.VITE_API_URL}/health
          </div>

          {error ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Error: {error}
            </div>
          ) : data ? (
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">status</dt>
                <dd className="font-medium">{data.status}</dd>
              </div>
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">timestamp</dt>
                <dd className="font-medium">{data.timestamp}</dd>
              </div>
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">version</dt>
                <dd className="font-medium">{data.version}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-3 text-sm text-stone-700">Loading…</div>
          )}
        </div>
      </div>
    </main>
  )
}
