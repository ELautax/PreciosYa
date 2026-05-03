import { useState } from 'react'

import {
  useAdminForceFetchIpc,
  useAdminIndices,
  useAdminStats,
  useAdminUpdatePlan,
  useAdminUsers,
} from '@/hooks/useAdmin'
import { useMe } from '@/hooks/useMe'

export default function AdminPage() {
  const { data: me, isLoading: loadingMe } = useMe()
  const [search, setSearch] = useState('')
  const usersQ = useAdminUsers(1, search)
  const statsQ = useAdminStats()
  const indicesQ = useAdminIndices()
  const updatePlanMut = useAdminUpdatePlan()
  const forceIpcMut = useAdminForceFetchIpc()

  if (loadingMe) {
    return <main className="page-shell text-sm text-stone-600">Cargando…</main>
  }

  if (!me?.isAdmin) {
    return (
      <main className="page-shell">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Esta sección es solo para administradores.
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="page-heading">Panel Admin</h1>
          <button
            type="button"
            onClick={() => void forceIpcMut.mutateAsync()}
            disabled={forceIpcMut.isPending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {forceIpcMut.isPending ? 'Ejecutando…' : 'Forzar fetch IPC'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Usuarios" value={statsQ.data?.users ?? 0} />
          <Card label="Locales activos" value={statsQ.data?.locals ?? 0} />
          <Card label="Productos activos" value={statsQ.data?.products ?? 0} />
          <Card label="Alertas" value={statsQ.data?.alerts ?? 0} />
        </div>

        <section className="surface-card p-4">
          <h2 className="text-sm font-medium text-stone-800">Usuarios</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usersQ.data?.items.map((u) => (
                  <tr key={u.id} className="border-b border-stone-100">
                    <td className="px-2 py-2">{u.name}</td>
                    <td className="px-2 py-2">{u.email}</td>
                    <td className="px-2 py-2">{u.plan}</td>
                    <td className="px-2 py-2">
                      <select
                        defaultValue={u.plan}
                        onChange={(e) =>
                          void updatePlanMut.mutateAsync({
                            userId: u.id,
                            plan: e.target.value as 'FREE' | 'PRO' | 'AGENCY',
                          })
                        }
                        className="rounded border border-stone-300 px-2 py-1 text-xs"
                      >
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="AGENCY">AGENCY</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-card p-4">
          <h2 className="text-sm font-medium text-stone-800">Índices recientes</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {indicesQ.data?.map((idx) => (
              <div key={idx.id} className="surface-soft p-3">
                <p className="text-xs text-stone-500">{idx.type}</p>
                <p className="text-sm font-semibold text-stone-900">{idx.valuePct.toFixed(2)}</p>
                <p className="text-xs text-stone-500">
                  {new Date(idx.period).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
    </div>
  )
}
