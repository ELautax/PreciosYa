import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) {
      void navigate('/login', { replace: true })
    }
  }, [loading, session, navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-text-muted">
        Cargando…
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
