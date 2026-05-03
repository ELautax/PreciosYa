import { useEffect, useState } from 'react'

import type { LocalDto } from '@/types/local'

const STORAGE_KEY = 'preciosya:selected-local-id'

export function useSelectedLocal(locals: LocalDto[] | undefined): [string, (id: string) => void] {
  const [selectedLocalId, setSelectedLocalId] = useState('')

  useEffect(() => {
    if (!locals || locals.length === 0) {
      setSelectedLocalId('')
      return
    }

    const saved =
      typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null

    const existsSaved = saved ? locals.some((l) => l.id === saved) : false
    const next = existsSaved ? saved : locals[0].id

    if (next && next !== selectedLocalId) {
      setSelectedLocalId(next)
    }
  }, [locals, selectedLocalId])

  function update(id: string): void {
    setSelectedLocalId(id)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id)
    }
  }

  return [selectedLocalId, update]
}
