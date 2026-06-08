import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-text-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600/30 border-t-primary-600" />
        <p className="mt-4 text-sm font-bold">Cargando sesión…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
