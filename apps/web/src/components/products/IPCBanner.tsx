import { TrendingUp, Zap, ChevronRight } from 'lucide-react'

type IPCBannerProps = {
  ipcPct: number | null
  onOpenBulk: () => void
}

export function IPCBanner({ ipcPct, onOpenBulk }: IPCBannerProps) {
  if (ipcPct === null) return null

  return (
    <div className="group surface-card relative overflow-hidden border-accent-100 bg-accent-50/50 p-6 shadow-accent-600/5 animate-slide-up">
      {/* Decorative Background Icon */}
      <div className="absolute right-0 top-0 -translate-y-4 translate-x-4 opacity-5 text-accent-600 group-hover:rotate-12 transition-transform duration-700">
         <TrendingUp size={120} />
      </div>

      <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-accent-600 text-white shadow-lg shadow-accent-600/20">
             <Zap size={24} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main leading-tight">
               Inflación Detectada: <span className="text-accent-600 font-mono tracking-tighter">{ipcPct.toFixed(2)}%</span>
            </h3>
            <p className="mt-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest leading-none">
               Índice oficial disponible
            </p>
            <p className="mt-3 text-sm font-medium text-text-muted max-w-md leading-relaxed">
               Actualizá los costos de todos tus productos en un solo paso para no perder rentabilidad frente a la inflación.
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onOpenBulk}
          className="btn-warning w-full sm:w-auto h-12 px-6 shadow-lg shadow-accent-600/20 group/btn animate-scale-in"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Actualizar Costos</span>
          <ChevronRight size={16} strokeWidth={3} className="ml-2 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
