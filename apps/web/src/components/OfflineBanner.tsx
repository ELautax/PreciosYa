import { useOfflineSync } from '@/hooks/useOfflineSync'

export function OfflineBanner() {
  const { isOffline } = useOfflineSync()

  if (!isOffline) return null

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Sin conexión: podés seguir navegando con datos en caché.
    </div>
  )
}
