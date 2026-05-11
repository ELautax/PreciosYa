import { useOfflineSync } from '@/hooks/useOfflineSync'

export function OfflineBanner() {
  const { isOffline } = useOfflineSync()

  if (!isOffline) return null

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Sin conexión: podés navegar con datos en caché; los cambios en productos o categorías se guardan en
      cola y se envían en orden al reconectar.
    </div>
  )
}
