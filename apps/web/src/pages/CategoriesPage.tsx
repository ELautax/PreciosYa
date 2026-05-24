import { Link } from 'react-router-dom'
import { Tags, ChevronLeft, Store, Info } from 'lucide-react'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useCategories, usePatchCategoryActive } from '@/hooks/useCategories'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import type { CategoryDto } from '@/types/category'
import type { LocalDto } from '@/types/local'
import { EmptyState } from '@/components/feedback/EmptyState'

function indexLabel(preferredIndex: string): string {
  if (preferredIndex.includes('ALIMENTOS')) return 'IPC Alimentos'
  if (preferredIndex === 'IPC_INDEC') return 'IPC General'
  return 'IPC por rubro INDEC'
}

function CategoryToggleRow({
  category,
  onToggle,
  pending,
}: {
  category: CategoryDto
  onToggle: (c: CategoryDto, active: boolean) => void
  pending: boolean
}) {
  return (
    <div
      className={`surface-card flex items-center justify-between gap-4 p-5 transition-all ${
        category.isActive ? 'border-primary-200/60' : 'opacity-60'
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner"
          style={{ backgroundColor: `${category.colorHex}15`, color: category.colorHex }}
        >
          <Tags size={24} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold uppercase tracking-tighter text-text-main">
            {category.name}
          </h3>
          <span className="mt-1 inline-flex rounded-lg border border-accent-100 bg-accent-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-accent-700">
            {indexLabel(category.preferredIndex)}
          </span>
        </div>
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
          {category.isActive ? 'Activo' : 'Off'}
        </span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-primary-600"
          checked={category.isActive}
          disabled={pending}
          onChange={(e) => onToggle(category, e.target.checked)}
        />
      </label>
    </div>
  )
}

function CategoriesMain({ locals }: { locals: LocalDto[] }) {
  const [localId, setLocalId] = useSelectedLocal(locals)
  const listQuery = useCategories(localId)
  const patchMut = usePatchCategoryActive(localId)

  function handleToggle(c: CategoryDto, isActive: boolean): void {
    void patchMut.mutateAsync({ id: c.id, isActive })
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-3xl animate-fade-in space-y-10">
        <header className="space-y-1">
          <Link
            to="/dashboard"
            className="group mb-1 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest leading-none text-primary-600 transition-all hover:text-primary-700"
          >
            <ChevronLeft
              size={14}
              strokeWidth={3}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Volver al Panel
          </Link>
          <h1 className="heading-xl">Rubros del negocio</h1>
          <p className="text-small max-w-lg">
            Rubros predefinidos según divisiones del IPC INDEC. Activá solo los que usás en tu
            comercio; cada uno tiene su propio índice de inflación.
          </p>
        </header>

        <div className="surface-card space-y-4 p-6">
          <label className="px-1 text-[10px] font-black uppercase tracking-widest text-text-subtle">
            Local activo
          </label>
          <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
        </div>

        <div className="surface-card flex items-start gap-3 border-primary-100 bg-primary-50/20 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-primary-600" />
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-text-muted">
            No podés crear rubros personalizados: elegís del catálogo oficial. Al aplicar IPC, se
            usa el porcentaje de la división vinculada a cada rubro.
          </p>
        </div>

        {listQuery.isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : listQuery.data?.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="Sin rubros"
            description="Los rubros se cargan automáticamente al crear el local."
            compact
          />
        ) : (
          <div className="grid animate-fade-in gap-3">
            {listQuery.data?.map((c) => (
              <CategoryToggleRow
                key={c.id}
                category={c}
                pending={patchMut.isPending}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function CategoriesPage() {
  const { data: locals, isLoading } = useLocals()

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-wrap animate-fade-in space-y-10">
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
        <div className="page-wrap max-w-2xl animate-fade-in py-12">
          <EmptyState
            icon={Store}
            title="Primero creá un local"
            description="Para gestionar rubros, necesitás al menos un local registrado."
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
