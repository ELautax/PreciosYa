import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tags, Plus, Edit3, Trash2, ChevronLeft, Store, Info, Palette, TrendingUp } from 'lucide-react'

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
import { EmptyState } from '@/components/feedback/EmptyState'

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
      window.confirm(`¿Eliminar la categoría "${c.name}"? Los productos quedarán sin rubro asociado.`)
    ) {
      void deleteMut.mutateAsync(c.id)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-4xl space-y-10 animate-fade-in">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link to="/dashboard" className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all leading-none mb-1">
              <ChevronLeft size={14} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
              Volver al Panel
            </Link>
            <h1 className="heading-xl">Rubros y Categorías</h1>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
           <div className="lg:col-span-1 space-y-6">
              <div className="surface-card p-6 space-y-6 shadow-xl shadow-primary-600/5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Local Activo</label>
                    <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
                 </div>

                 <div className="h-px bg-border" />

                 <form onSubmit={(e) => void handleCreate(e)} className="space-y-5 animate-fade-in">
                    <div>
                       <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Plus size={16} strokeWidth={3} className="text-primary-600" />
                          Nuevo Rubro
                       </h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle">Nombre del Rubro</label>
                             <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej. Bebidas, Almacén"
                                className="w-full h-11"
                             />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle flex items-center gap-1.5">
                                   <Palette size={12} className="text-primary-600" />
                                   Color
                                </label>
                                <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-surface-soft">
                                   <input
                                      type="color"
                                      value={newColor}
                                      onChange={(e) => setNewColor(e.target.value)}
                                      className="h-7 w-7 cursor-pointer border-none bg-transparent"
                                   />
                                   <span className="font-mono text-[10px] font-bold text-text-muted uppercase">{newColor}</span>
                                </div>
                             </div>
                             <div className="flex-[1.5] space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle flex items-center gap-1.5">
                                   <TrendingUp size={12} className="text-primary-600" />
                                   IPC Preferido
                                </label>
                                <select
                                   value={newPreferredIndex}
                                   onChange={(e) => setNewPreferredIndex(e.target.value as 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS')}
                                   className="w-full h-11 text-xs font-bold"
                                >
                                   <option value="IPC_INDEC">IPC General</option>
                                   <option value="IPC_INDEC_ALIMENTOS">IPC Alimentos</option>
                                </select>
                             </div>
                          </div>
                       </div>
                    </div>

                    <button
                       type="submit"
                       disabled={createMut.isPending || !newName.trim()}
                       className="btn-primary w-full h-12 shadow-xl shadow-primary-600/10 active:scale-95 transition-all"
                    >
                       <Plus size={18} strokeWidth={3} />
                       <span className="text-xs font-black uppercase tracking-widest">Crear Rubro</span>
                    </button>
                 </form>
              </div>

              <div className="surface-card p-5 bg-primary-50/20 border-primary-100 flex items-start gap-3">
                 <Info size={18} className="text-primary-600 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                    Los rubros te permiten agrupar productos y aplicar índices de inflación específicos según el tipo de mercadería que vendés.
                 </p>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                 <h2 className="heading-lg">Rubros Registrados</h2>
                 <div className="h-px flex-1 bg-border" />
              </div>

              {listQuery.isLoading ? (
                <div className="grid gap-3">
                   {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}
                </div>
              ) : listQuery.data?.length === 0 ? (
                <div className="py-12">
                   <EmptyState 
                      icon={Tags}
                      title="Sin rubros creados"
                      description="Cargá tu primer rubro para empezar a organizar mejor tus productos y márgenes."
                      compact
                   />
                </div>
              ) : (
                <div className="grid gap-3 animate-fade-in">
                   {listQuery.data?.map((c) => (
                      <div 
                         key={c.id} 
                         className={`surface-card group relative p-5 transition-all duration-300 hover:border-primary-600/30 ${editingId === c.id ? 'ring-2 ring-primary-600 shadow-xl' : ''}`}
                      >
                         {editingId === c.id ? (
                           <div className="space-y-5 animate-fade-in">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                 <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Nombre del Rubro</label>
                                    <input
                                       value={editName}
                                       onChange={(e) => setEditName(e.target.value)}
                                       className="w-full h-11"
                                       autoFocus
                                    />
                                 </div>
                                 <div className="flex gap-3">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Color</label>
                                       <input
                                          type="color"
                                          value={editColor}
                                          onChange={(e) => setEditColor(e.target.value)}
                                          className="h-11 w-11 cursor-pointer rounded-xl border border-border bg-surface-soft p-1.5"
                                       />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">IPC</label>
                                       <select
                                          value={editPreferredIndex}
                                          onChange={(e) => setEditPreferredIndex(e.target.value as 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS')}
                                          className="w-full h-11 text-xs font-bold"
                                       >
                                          <option value="IPC_INDEC">IPC General</option>
                                          <option value="IPC_INDEC_ALIMENTOS">IPC Alimentos</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => void saveEdit()}
                                    disabled={updateMut.isPending || !editName.trim()}
                                    className="btn-primary flex-1 h-11"
                                 >
                                    <span className="text-xs font-black uppercase tracking-widest">Guardar Cambios</span>
                                 </button>
                                 <button
                                    onClick={cancelEdit}
                                    className="btn-secondary px-6 h-11 border-none bg-surface-soft shadow-none"
                                 >
                                    <span className="text-xs font-black uppercase tracking-widest text-text-subtle">Cancelar</span>
                                 </button>
                              </div>
                           </div>
                         ) : (
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div 
                                    className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-inner"
                                    style={{ backgroundColor: `${c.colorHex}15`, color: c.colorHex }}
                                 >
                                    <Tags size={24} strokeWidth={2.5} />
                                 </div>
                                 <div className="min-w-0">
                                    <h3 className="text-base font-extrabold text-text-main leading-tight truncate uppercase tracking-tighter">{c.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                                          c.preferredIndex === 'IPC_INDEC_ALIMENTOS' ? 'border-primary-100 bg-primary-50 text-primary-700' : 'border-accent-100 bg-accent-50 text-accent-700'
                                       }`}>
                                          {c.preferredIndex === 'IPC_INDEC_ALIMENTOS' ? 'IPC Alimentos' : 'IPC General'}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button
                                    onClick={() => startEdit(c)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-text-subtle hover:bg-surface-soft hover:text-primary-600 transition-all active:scale-90"
                                    title="Editar Rubro"
                                 >
                                    <Edit3 size={18} strokeWidth={2.5} />
                                 </button>
                                 <button
                                    onClick={() => handleDelete(c)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-text-subtle hover:bg-danger-50 hover:text-danger-600 transition-all active:scale-90"
                                    title="Eliminar Rubro"
                                 >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                 </button>
                              </div>
                           </div>
                         )}
                      </div>
                   ))}
                </div>
              )}
           </div>
        </section>
      </div>
    </main>
  )
}

export default function CategoriesPage() {
  const { data: locals, isLoading } = useLocals()

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-wrap space-y-10 animate-fade-in">
           <div className="skeleton h-12 w-64" />
           <div className="skeleton h-24 w-full" />
           <div className="skeleton h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="page-wrap max-w-2xl py-12 animate-fade-in">
           <EmptyState 
              icon={Store}
              title="Primero creá un local"
              description="Para gestionar rubros, necesitás tener al menos un local registrado en el sistema."
              action={
                <Link to="/products" className="btn-primary">
                   Ir a Productos
                </Link>
              }
           />
        </div>
      </main>
    )
  }

  return <CategoriesMain locals={locals} />
}
