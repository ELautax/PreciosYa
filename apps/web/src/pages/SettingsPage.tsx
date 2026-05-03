import { useEffect, useMemo, useState } from 'react'
import type { ApiSuccess } from 'shared'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useApiClient } from '@/hooks/useApiClient'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProducts } from '@/hooks/useProducts'
import type { AppUser } from '@/types/appUser'

type TabId = 'business' | 'account' | 'plan'

function planProductLimit(plan: string): number | null {
  if (plan === 'FREE') return 30
  return null
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('business')
  const api = useApiClient()
  const [user, setUser] = useState<AppUser | null>(null)
  const { data: locals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === localId) ?? null,
    [locals, localId],
  )
  const productsQ = useProducts(localId || undefined, { page: 1, limit: 1 })

  useEffect(() => {
    let cancelled = false
    void api
      .get<ApiSuccess<{ user: AppUser }>>('/api/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data.data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const usedProducts = productsQ.data?.total ?? 0
  const productLimit = planProductLimit(user?.plan ?? 'FREE')
  const usagePct = productLimit ? Math.min(100, (usedProducts / productLimit) * 100) : 0

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-stone-900">Configuración</h1>
        <p className="mt-1 text-sm text-stone-600">
          Ajustá tu negocio, cuenta y plan desde un solo lugar.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('business')}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === 'business'
                ? 'bg-green-100 font-medium text-green-900'
                : 'border border-stone-300 bg-white text-stone-700'
            }`}
          >
            Mi Negocio
          </button>
          <button
            type="button"
            onClick={() => setTab('account')}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === 'account'
                ? 'bg-green-100 font-medium text-green-900'
                : 'border border-stone-300 bg-white text-stone-700'
            }`}
          >
            Mi Cuenta
          </button>
          <button
            type="button"
            onClick={() => setTab('plan')}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === 'plan'
                ? 'bg-green-100 font-medium text-green-900'
                : 'border border-stone-300 bg-white text-stone-700'
            }`}
          >
            Mi Plan
          </button>
        </div>

        {tab === 'business' ? (
          <section className="mt-4 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-medium text-stone-800">Datos del local</h2>
            {locals && locals.length > 0 ? (
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <LocalSelector
                  locals={locals}
                  value={localId}
                  onChange={setLocalId}
                  label="Local"
                />
                {selectedLocal ? (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-stone-500">Nombre</dt>
                      <dd className="font-medium text-stone-900">{selectedLocal.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">Dirección</dt>
                      <dd>{selectedLocal.address || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">Moneda</dt>
                      <dd>{selectedLocal.currency}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">Margen mínimo</dt>
                      <dd>{selectedLocal.minMarginPct.toFixed(2)}%</dd>
                    </div>
                  </dl>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-600">No hay locales creados todavía.</p>
            )}
          </section>
        ) : null}

        {tab === 'account' ? (
          <section className="mt-4 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-medium text-stone-800">Datos de la cuenta</h2>
            {user ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-stone-500">Nombre</dt>
                  <dd className="font-medium text-stone-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Plan actual</dt>
                  <dd>{user.plan}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Rol</dt>
                  <dd>{user.isAdmin ? 'Administrador' : 'Usuario'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Vencimiento</dt>
                  <dd>{user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('es-AR') : '—'}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-stone-600">Cargando cuenta…</p>
            )}
          </section>
        ) : null}

        {tab === 'plan' ? (
          <section className="mt-4 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-medium text-stone-800">Uso del plan</h2>
            <p className="mt-2 text-sm text-stone-600">
              Productos activos en el local seleccionado.
            </p>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-stone-700">Uso</span>
                <span className="font-medium text-stone-900">
                  {productLimit ? `${usedProducts}/${productLimit}` : `${usedProducts} (ilimitado)`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-200">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: `${productLimit ? usagePct : 100}%` }}
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
