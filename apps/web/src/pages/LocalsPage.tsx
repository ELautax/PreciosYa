import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useCreateLocal, useLocals, useUpdateLocal } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'

export default function LocalsPage() {
  const { data: locals, isLoading } = useLocals()
  const createMut = useCreateLocal()
  const updateMut = useUpdateLocal()

  const [selectedLocalId, setSelectedLocalId] = useSelectedLocal(locals)
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === selectedLocalId) ?? null,
    [locals, selectedLocalId],
  )

  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')

  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editMinMargin, setEditMinMargin] = useState('20')
  const [editCurrency, setEditCurrency] = useState('ARS')

  useEffect(() => {
    if (!selectedLocal) return
    setEditName(selectedLocal.name)
    setEditAddress(selectedLocal.address ?? '')
    setEditMinMargin(String(selectedLocal.minMarginPct))
    setEditCurrency(selectedLocal.currency)
  }, [selectedLocal])

  async function onCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return
    const created = await createMut.mutateAsync({
      name: newName.trim(),
      address: newAddress.trim() ? newAddress.trim() : null,
    })
    setNewName('')
    setNewAddress('')
    setSelectedLocalId(created.id)
  }

  async function onSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!selectedLocal) return
    const minMarginPct = Number(editMinMargin)
    if (!Number.isFinite(minMarginPct) || minMarginPct < 0 || minMarginPct > 99.99) return

    await updateMut.mutateAsync({
      id: selectedLocal.id,
      body: {
        name: editName.trim(),
        address: editAddress.trim() ? editAddress.trim() : null,
        minMarginPct,
        currency: editCurrency.trim().toUpperCase(),
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        Cargando…
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900">Locales</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/history"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Historial
            </Link>
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
          </div>
        </div>

        <form
          onSubmit={(e) => void onCreate(e)}
          className="mt-6 rounded-xl border border-stone-200 bg-white p-5"
        >
          <h2 className="text-sm font-medium text-stone-800">Crear nuevo local</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              Nombre
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="Ej. Kiosco Centro"
              />
            </label>
            <label className="text-sm text-stone-700">
              Dirección (opcional)
              <input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            {createMut.isPending ? 'Creando…' : 'Crear local'}
          </button>
        </form>

        {locals && locals.length > 0 ? (
          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-stone-800">Editar local</h2>
              <LocalSelector
                locals={locals}
                value={selectedLocalId}
                onChange={(id) => {
                  setSelectedLocalId(id)
                  const local = locals.find((l) => l.id === id)
                  if (!local) return
                  setEditName(local.name)
                  setEditAddress(local.address ?? '')
                  setEditMinMargin(String(local.minMarginPct))
                  setEditCurrency(local.currency)
                }}
              />
            </div>
            {selectedLocal ? (
              <form
                onSubmit={(e) => void onSave(e)}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <label className="text-sm text-stone-700">
                  Nombre
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-stone-700">
                  Dirección
                  <input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-stone-700">
                  Margen mínimo (%)
                  <input
                    type="number"
                    step="0.01"
                    value={editMinMargin}
                    onChange={(e) => setEditMinMargin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-stone-700">
                  Moneda
                  <input
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                    placeholder="ARS"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={updateMut.isPending}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {updateMut.isPending ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 text-sm text-stone-500">Seleccioná un local para editar.</p>
            )}
          </section>
        ) : null}
      </div>
    </main>
  )
}
