import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'
import { useLocals } from '@/hooks/useLocals'
import type { CategoryDto } from '@/types/category'
import type { LocalDto } from '@/types/local'

function CategoriesMain({ locals }: { locals: LocalDto[] }) {
  const [localId, setLocalId] = useState(locals[0].id)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#16A34A')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#16A34A')

  const listQuery = useCategories(localId)
  const createMut = useCreateCategory(localId)
  const updateMut = useUpdateCategory(localId)
  const deleteMut = useDeleteCategory(localId)

  useEffect(() => {
    if (!locals.some((l) => l.id === localId)) {
      setLocalId(locals[0].id)
    }
  }, [locals, localId])

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return
    await createMut.mutateAsync({
      name: newName.trim(),
      colorHex: newColor,
    })
    setNewName('')
    setNewColor('#16A34A')
  }

  function startEdit(c: CategoryDto): void {
    setEditingId(c.id)
    setEditName(c.name)
    setEditColor(c.colorHex)
  }

  async function saveEdit(): Promise<void> {
    if (!editingId || !editName.trim()) return
    await updateMut.mutateAsync({
      id: editingId,
      body: { name: editName.trim(), colorHex: editColor },
    })
    setEditingId(null)
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
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900">Categorías</h1>
            <p className="mt-1 text-sm text-stone-600">
              Agrupá productos por rubro y asignalos al cargar o editar cada ítem.
            </p>
          </div>
          <Link
            to="/products"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
          >
            Productos
          </Link>
        </div>

        {locals.length > 1 ? (
          <label className="mt-6 flex flex-wrap items-center gap-2 text-sm text-stone-700">
            Local
            <select
              value={localId}
              onChange={(e) => setLocalId(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              {locals.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <form
          onSubmit={(e) => void handleCreate(e)}
          className="mt-8 space-y-3 rounded-xl border border-stone-200 bg-white p-5"
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
            <p className="text-sm text-stone-600">Cargando…</p>
          ) : listQuery.data ? (
            <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
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
                          className="min-w-[120px] flex-1 rounded-lg border border-stone-300 px-2 py-1 text-sm"
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded border border-stone-300"
                        />
                        <button
                          type="button"
                          onClick={() => void saveEdit()}
                          disabled={updateMut.isPending}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 hover:bg-stone-50"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-stone-900">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 hover:bg-stone-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        Cargando…
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-md">
          <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
            ← Panel
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-stone-900">Categorías</h1>
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
