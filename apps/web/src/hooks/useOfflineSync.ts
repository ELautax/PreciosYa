import { useEffect, useState } from 'react'

type OfflineSyncState = {
  isOffline: boolean
  lastReconnectedAt: string | null
}

export function useOfflineSync(): OfflineSyncState {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )
  const [lastReconnectedAt, setLastReconnectedAt] = useState<string | null>(null)

  useEffect(() => {
    function onOffline() {
      setIsOffline(true)
    }
    function onOnline() {
      setIsOffline(false)
      setLastReconnectedAt(new Date().toISOString())
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return { isOffline, lastReconnectedAt }
}
