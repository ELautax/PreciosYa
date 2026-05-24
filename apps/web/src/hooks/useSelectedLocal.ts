import { useEffect, useState } from 'react'

import type { LocalDto } from '@/types/local'

const STORAGE_KEY = 'preciosya:selected-local-id'

function resolveLocalId(locals: LocalDto[] | undefined): string {
  if (!locals?.length) return ''

  const saved =
    typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null

  const existsSaved = saved ? locals.some((l) => l.id === saved) : false
  return existsSaved && saved ? saved : locals[0].id
}

export function useSelectedLocal(locals: LocalDto[] | undefined): [string, (id: string) => void] {
  const [selectedLocalId, setSelectedLocalId] = useState(() => resolveLocalId(locals))

  useEffect(() => {
    const next = resolveLocalId(locals)
    setSelectedLocalId((prev) => (prev === next ? prev : next))
  }, [locals])

  function update(id: string): void {
    setSelectedLocalId(id)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id)
    }
  }

  return [selectedLocalId, update]
}
