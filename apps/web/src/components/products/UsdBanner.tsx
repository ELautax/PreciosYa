import { DollarSign, Zap, ChevronRight } from 'lucide-react'

type UsdBannerProps = {
  usdRateArs: number | null
  variationPct: number | null
  onOpenBulk: () => void
}

export function UsdBanner({ usdRateArs, variationPct, onOpenBulk }: UsdBannerProps) {
  if (usdRateArs === null && variationPct === null) return null

  const showAlert =
    variationPct !== null && Math.abs(variationPct) >= 2.5

  return (
    <div
      className={`group surface-card relative overflow-hidden p-6 animate-slide-up ${
        showAlert
          ? 'border-warning-200 bg-warning-50/50 shadow-warning-600/5'
          : 'border-primary-100 bg-primary-50/50 shadow-primary-600/5'
      }`}
    >
      <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] text-white shadow-lg ${
              showAlert ? 'bg-warning-600 shadow-warning-600/20' : 'bg-primary-600 shadow-primary-600/20'
            }`}
          >
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main leading-tight">
              Dólar oficial BCRA:{' '}
              <span className="font-mono tracking-tighter text-primary-700">
                {usdRateArs !== null
                  ? `$${usdRateArs.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
                  : '—'}
              </span>
            </h3>
            <p className="mt-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest leading-none">
              {variationPct !== null
                ? `Variación diaria ${variationPct >= 0 ? '+' : ''}${variationPct.toFixed(2)}%`
                : 'Cotización disponible'}
            </p>
            <p className="mt-3 text-sm font-medium text-text-muted max-w-md leading-relaxed">
              Rubros marcados como &quot;Indexar por USD&quot; se ajustan con la variación del tipo de
              cambio oficial, no con el IPC mensual.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBulk}
          className="btn-primary w-full sm:w-auto h-12 px-6 shadow-lg group/btn animate-scale-in"
        >
          <Zap size={18} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">Aplicar USD</span>
          <ChevronRight
            size={16}
            strokeWidth={3}
            className="ml-2 transition-transform group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  )
}
