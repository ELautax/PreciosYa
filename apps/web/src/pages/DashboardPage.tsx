import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { ApiSuccess } from 'shared'

import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuth } from '@/contexts/AuthContext'
import { env } from '@/config/env'
import { useApiClient } from '@/hooks/useApiClient'
import type { AppUser } from '@/types/appUser'

type HealthData = {
  status: string
  timestamp: string
  version: string
}

export default function DashboardPage() {
  const { signOut } = useAuth()
  const api = useApiClient()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [healthErr, setHealthErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void api
      .get<ApiSuccess<{ user: AppUser }>>('/api/auth/me')
      .then((res) => {
        if (!cancelled) setProfile(res.data.data.user)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`${env.VITE_API_URL}/health`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: unknown = await res.json()
        if (cancelled || typeof json !== 'object' || json === null) return
        if (
          'success' in json &&
          json.success === true &&
          'data' in json &&
          typeof json.data === 'object' &&
          json.data !== null
        ) {
          const d = json.data as Record<string, unknown>
          if (
            typeof d.status === 'string' &&
            typeof d.timestamp === 'string' &&
            typeof d.version === 'string'
          ) {
            setHealth({
              status: d.status,
              timestamp: d.timestamp,
              version: d.version,
            })
          }
        }
      } catch (e) {
        if (!cancelled)
          setHealthErr(e instanceof Error ? e.message : 'Error de red')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Panel</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/products"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Productos
            </Link>
            <Link
              to="/categories"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Categorías
            </Link>
            <Link
              to="/locals"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Locales
            </Link>
            <Link
              to="/history"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Historial
            </Link>
            <NotificationCenter />
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        {profile ? (
          <p className="mt-2 text-sm text-stone-600">
            Hola, <span className="font-medium text-stone-800">{profile.name}</span> (
            {profile.email})
          </p>
        ) : (
          <p className="mt-2 text-sm text-stone-600">Cargando perfil…</p>
        )}

        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-xs font-medium text-stone-500">
            GET {env.VITE_API_URL}/health
          </div>
          {healthErr ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {healthErr}
            </div>
          ) : health ? (
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">status</dt>
                <dd className="font-medium">{health.status}</dd>
              </div>
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">timestamp</dt>
                <dd className="font-medium">{health.timestamp}</dd>
              </div>
              <div className="rounded-lg bg-stone-50 p-3">
                <dt className="text-xs text-stone-500">version</dt>
                <dd className="font-medium">{health.version}</dd>
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
