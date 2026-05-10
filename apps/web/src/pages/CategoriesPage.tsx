import { useState } from 'react'
import { Link } from 'react-router-dom'

import { LocalSelector } from '@/components/locals/LocalSelector'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import type { CategoryDto } from '@/types/category'
import type { LocalDto } from '@/types/local'

function CategoriesMain({ locals }: { locals: LocalDto[] }) {
  const [localId, setLocalId] = useSelectedLocal(locals)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#16A34A')
  const [newPreferredIndex, setNewPreferredIndex] = useState<'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'>('IPC_INDEC')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#16A34A')
  const [editPreferredIndex, setEditPreferredIndex] = useState<'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'>('IPC_INDEC')

  const listQuery = useCategories(localId)
  const createMut = useCreateCategory(localId)
  const updateMut = useUpdateCategory(localId)
  const deleteMut = useDeleteCategory(localId)

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return
    await createMut.mutateAsync({
      name: newName.trim(),
      colorHex: newColor,
      preferredIndex: newPreferredIndex,
    })
    setNewName('')
    setNewColor('#16A34A')
    setNewPreferredIndex('IPC_INDEC')
  }

  function startEdit(c: CategoryDto): void {
    setEditingId(c.id)
    setEditName(c.name)
    setEditColor(c.colorHex)
    setEditPreferredIndex(c.preferredIndex)
  }

  function cancelEdit(): void {
    setEditingId(null)
    setEditName('')
    setEditColor('#16A34A')
    setEditPreferredIndex('IPC_INDEC')
  }

  async function saveEdit(): Promise<void> {
    if (!editingId || !editName.trim()) return
    await updateMut.mutateAsync({
      id: editingId,
      body: {
        name: editName.trim(),
        colorHex: editColor,
        preferredIndex: editPreferredIndex,
      },
    })
    cancelEdit()
  }

  function handleDelete(c: CategoryDto): void {
    if (
      typeof window !== 'undefined' &&
      window.confirm(`¿Eliminar la categoría "${c.name}"? Los productos quedarán sin categoría.`)
    ) {
      void deleteMut.mutateAsync(c.id)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 page-heading">Categorías</h1>
            <p className="page-subtitle">
              Agrupá productos por rubro y asignalos al cargar o editar cada ítem.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/history"
              className="btn-soft"
            >
              Historial
            </Link>
            <Link
              to="/locals"
              className="btn-soft"
            >
              Locales
            </Link>
            <Link
              to="/products"
              className="btn-soft"
            >
              Productos
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
        </div>

        <form
          onSubmit={(e) => void handleCreate(e)}
          className="surface-card mt-8 space-y-3 p-5"
        >
          <h2 className="text-sm font-medium text-stone-800">Nueva categoría</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[160px] flex-1 text-sm text-stone-700">
              Nombre
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="Ej. Bebidas"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              Color
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-stone-300 bg-white"
              />
            </label>
            <label className="min-w-[180px] text-sm text-stone-700">
              IPC por defecto
              <select
                value={newPreferredIndex}
                onChange={(e) =>
                  setNewPreferredIndex(e.target.value as 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS')
                }
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="IPC_INDEC">IPC General</option>
                <option value="IPC_INDEC_ALIMENTOS">IPC Alimentos</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {createMut.isPending ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          {listQuery.isLoading ? (
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded-xl bg-stone-200" />
              <div className="h-16 animate-pulse rounded-xl bg-stone-200" />
              <div className="h-16 animate-pulse rounded-xl bg-stone-200" />
            </div>
          ) : listQuery.data ? (
            <ul className="surface-card divide-y divide-stone-200">
              {listQuery.data.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-stone-500">
                  No hay categorías en este local.
                </li>
              ) : (
                listQuery.data.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-stone-200"
                      style={{ backgroundColor: c.colorHex }}
                      aria-hidden
                    />
                    {editingId === c.id ? (
                      <>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                              event.preventDefault()
                              cancelEdit()
                            }
                          }}
                          className="min-w-[120px] flex-1 rounded-lg border border-stone-300 px-2 py-1 text-sm"
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded border border-stone-300"
                        />
                        <select
                          value={editPreferredIndex}
                          onChange={(e) =>
                            setEditPreferredIndex(
                              e.target.value as 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS',
                            )
                          }
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                        >
                          <option value="IPC_INDEC">IPC General</option>
                          <option value="IPC_INDEC_ALIMENTOS">IPC Alimentos</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => void saveEdit()}
                          disabled={updateMut.isPending}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-stone-900">{c.name}</span>
                        <span className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-700">
                          {c.preferredIndex === 'IPC_INDEC_ALIMENTOS'
                            ? 'IPC Alimentos'
                            : 'IPC General'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-sm text-red-700">No se pudieron cargar las categorías.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CategoriesPage() {
  const { data: locals, isLoading } = useLocals()

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-wrap max-w-2xl space-y-4">
          <div className="h-10 w-44 animate-pulse rounded bg-stone-200" />
          <div className="h-20 animate-pulse rounded-xl bg-stone-200" />
          <div className="h-64 animate-pulse rounded-xl bg-stone-200" />
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-md">
          <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
            ← Panel
          </Link>
          <h1 className="mt-4 page-heading">Categorías</h1>
          <p className="mt-2 text-sm text-stone-600">Primero creá un local desde Productos.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Ir a productos
          </Link>
        </div>
      </main>
    )
  }

  return <CategoriesMain locals={locals} />
}
