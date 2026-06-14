import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, Plus, Save, ChevronLeft, MapPin, Percent, Edit3, Info, AlertTriangle } from 'lucide-react'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useCreateLocal, useLocals, useUpdateLocal } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { EmptyState } from '@/components/feedback/EmptyState'

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
      <div className="page-shell">
        <div className="page-wrap space-y-10 animate-fade-in">
           <div className="skeleton h-12 w-64" />
           <div className="skeleton h-48 w-full rounded-[2rem]" />
           <div className="skeleton h-64 w-full rounded-[2rem]" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-wrap max-w-4xl space-y-10 animate-fade-in">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link to="/dashboard" className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all leading-none mb-1">
              <ChevronLeft size={14} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
              Volver al Panel
            </Link>
            <h1 className="heading-xl">Mis Locales</h1>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
           {/* Section: Create Local */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                 <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/20">
                    <Plus size={18} strokeWidth={3} />
                 </div>
                 <h2 className="heading-lg">Registrar Local</h2>
              </div>

              <div className="surface-card p-6 shadow-xl shadow-primary-600/5">
                 <form onSubmit={(e) => void onCreate(e)} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1 flex items-center gap-2">
                          Nombre del Negocio
                       </label>
                       <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Ej. Kiosco Central"
                          className="w-full h-12"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1 flex items-center gap-2">
                          <MapPin size={12} className="text-primary-600" />
                          Dirección (Opcional)
                       </label>
                       <input
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Ej. Av. Corrientes 1234"
                          className="w-full h-12"
                       />
                    </div>
                    <button
                       type="submit"
                       disabled={createMut.isPending || !newName.trim()}
                       className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20 active:scale-95 transition-all mt-2"
                    >
                       <Store size={20} strokeWidth={2.5} className="mr-2" />
                       <span className="text-sm font-black uppercase tracking-widest">Registrar Nuevo Local</span>
                    </button>
                 </form>
              </div>

              <div className="surface-card p-5 bg-primary-50/20 border-primary-100 flex items-start gap-4">
                 <div className="rounded-full bg-white p-2 shadow-sm text-primary-600 shrink-0 mt-0.5">
                    <Info size={16} />
                 </div>
                 <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                    Podés gestionar múltiples puntos de venta de forma independiente, cada uno con sus propios productos, márgenes y categorías.
                 </p>
              </div>
           </section>

           {/* Section: Edit Local */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                 <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-accent-600 text-white shadow-md shadow-accent-600/20">
                    <Edit3 size={18} strokeWidth={2.5} />
                 </div>
                 <h2 className="heading-lg">Gestionar Existente</h2>
              </div>

              {locals && locals.length > 0 ? (
                <div className="surface-card p-6 shadow-xl shadow-accent-600/5 space-y-8 animate-fade-in">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Seleccionar para editar</label>
                      <LocalSelector
                         locals={locals}
                         value={selectedLocalId}
                         onChange={(id) => {
                           setSelectedLocalId(id)
                         }}
                      />
                   </div>

                   <div className="h-px bg-border" />

                   {selectedLocal ? (
                     <form onSubmit={(e) => void onSave(e)} className="space-y-5 animate-fade-in">
                        <div className="grid gap-4 sm:grid-cols-2">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Nombre</label>
                              <input
                                 value={editName}
                                 onChange={(e) => setEditName(e.target.value)}
                                 className="w-full h-11 font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Moneda</label>
                              <input
                                 value={editCurrency}
                                 onChange={(e) => setEditCurrency(e.target.value)}
                                 className="w-full h-11 font-mono font-bold uppercase"
                                 placeholder="ARS"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Dirección</label>
                           <input
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="w-full h-11 font-medium"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1 flex items-center gap-1.5 leading-none mb-1">
                              <Percent size={12} className="text-accent-600" />
                              Margen de Alerta Mínimo (%)
                           </label>
                           <input
                              type="number"
                              step="0.01"
                              value={editMinMargin}
                              onChange={(e) => setEditMinMargin(e.target.value)}
                              className="w-full h-11 font-mono font-black text-accent-600 text-lg"
                           />
                        </div>

                        <button
                           type="submit"
                           disabled={updateMut.isPending}
                           className="btn-warning w-full h-12 shadow-xl shadow-accent-600/10 mt-2 active:scale-95 transition-all"
                        >
                           <Save size={18} strokeWidth={3} className="mr-2" />
                           <span className="text-xs font-black uppercase tracking-widest">Guardar Cambios</span>
                        </button>
                     </form>
                   ) : (
                     <div className="py-8 flex flex-col items-center justify-center text-center">
                        <AlertTriangle size={32} className="text-text-subtle opacity-30 mb-3" />
                        <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Seleccioná un local para realizar ajustes</p>
                     </div>
                   )}
                </div>
              ) : (
                <div className="surface-card p-12 text-center animate-fade-in border-dashed">
                   <EmptyState 
                      icon={Store}
                      title="Sin locales"
                      description="No tenés locales registrados para editar. Creá uno a la izquierda."
                      compact
                   />
                </div>
              )}
           </section>
        </div>
      </div>
    </div>
  )
}
