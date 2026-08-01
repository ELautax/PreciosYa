import { WifiOff } from 'lucide-react'
import { useOfflineSync } from '@/hooks/useOfflineSync'

export function OfflineBanner() {
  const { isOffline } = useOfflineSync()

  if (!isOffline) return null

  return (
    <div className="fixed top-20 left-1/2 z-[100] w-full max-w-sm -translate-x-1/2 px-4 animate-slide-down pointer-events-none md:top-6">
      <div className="flex items-center gap-3 rounded-2xl border border-warning-100 bg-warning-50/90 p-4 shadow-warm-lg ring-1 ring-black/5 backdrop-blur-lg pointer-events-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-warning-600 shadow-sm dark:bg-black/20">
          <WifiOff size={22} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-none text-warning-700">Sin conexión</p>
          <p className="mt-1.5 text-xs font-semibold leading-snug text-warning-800/90">
            Podés seguir cargando productos; se sincronizan al reconectar.
          </p>
        </div>
      </div>
    </div>
  )
}
