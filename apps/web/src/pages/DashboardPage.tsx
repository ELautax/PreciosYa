import { useEffect, useMemo, useState } from 'react'

import type { ApiSuccess } from 'shared'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useLatestExport } from '@/hooks/useExports'
import { useApiClient } from '@/hooks/useApiClient'
import { useIpcLatest } from '@/hooks/useIpc'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProducts } from '@/hooks/useProducts'
import type { AppUser } from '@/types/appUser'

export default function DashboardPage() {
  const api = useApiClient()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const { data: locals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === localId) ?? null,
    [locals, localId],
  )
  const productsQ = useProducts(localId || undefined, { page: 1, limit: 1 })
  const alertsQ = useProducts(localId || undefined, { page: 1, limit: 1, isAlert: true })
  const ipcQ = useIpcLatest()
  const latestExportQ = useLatestExport()

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

  return (
    <main className="page-shell text-stone-900">
      <div className="page-wrap">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="page-heading">Panel</h1>
            {profile ? (
              <p className="page-subtitle">
                Hola, <span className="font-medium text-stone-800">{profile.name}</span> (
                {profile.email})
                {profile.isAdmin ? (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Admin
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="mt-1 text-sm text-stone-600">Cargando perfil…</p>
            )}
          </div>
          {locals ? (
            <LocalSelector
              locals={locals}
              value={localId}
              onChange={setLocalId}
              label="Local activo"
            />
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kpi-card">
            <p className="kpi-label">Productos activos</p>
            <p className="kpi-value">
              {productsQ.data?.total ?? 0}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Alertas de margen</p>
            <p className="kpi-value text-red-700">{alertsQ.data?.total ?? 0}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Último IPC</p>
            <p className="kpi-value text-amber-700">
              {ipcQ.data?.ipc ? `${ipcQ.data.ipc.valuePct.toFixed(2)}%` : '—'}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Última exportación</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {latestExportQ.data?.priceList
                ? new Date(latestExportQ.data.priceList.createdAt).toLocaleDateString('es-AR')
                : 'Sin exportaciones'}
            </p>
          </div>
        </div>

        <div className="mt-6 surface-card p-4 text-sm text-stone-600">
          {selectedLocal ? (
            <p>
              Estás viendo datos del local <span className="font-medium text-stone-800">{selectedLocal.name}</span>.
            </p>
          ) : (
            <p>Creá un local para comenzar a trabajar con productos y precios.</p>
          )}
        </div>
      </div>
    </main>
  )
}
