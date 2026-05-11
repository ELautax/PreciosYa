import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useApiClient } from '@/hooks/useApiClient'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { drainOfflineOutboxSequentially } from '@/lib/offline'
import { appToast } from '@/lib/toast'

/** Ejecuta operaciones pendientes FIFO al volver online o al iniciar con sesión. */
export function useOfflineOutboxDrain() {
  const api = useApiClient()
  const qc = useQueryClient()
  const { session } = useAuth()
  const { isOffline } = useOfflineSync()

  useEffect(() => {
    const token = session?.access_token
    if (!token || isOffline) return

    let cancelled = false
    async function run() {
      const { processed } = await drainOfflineOutboxSequentially(api)
      if (cancelled || processed === 0) return
      await qc.invalidateQueries({ queryKey: ['products'] })
      await qc.invalidateQueries({ queryKey: ['categories'] })
      appToast.success(
        processed === 1
          ? 'Sincronizamos 1 cambio guardado offline'
          : `Sincronizamos ${processed} cambios guardados offline`,
      )
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [api, qc, session?.access_token, isOffline])
}
