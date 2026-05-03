import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { session, loading, supabaseConfigured, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      void navigate('/dashboard', { replace: true })
    }
  }, [loading, session, navigate])

  async function handleGoogle(): Promise<void> {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-600">Cargando…</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">PreciosYa</h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          Iniciá sesión para gestionar precios y listas.
        </p>

        <div className="mt-10 w-full rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          {!supabaseConfigured ? (
            <p className="text-sm text-red-700">
              Configurá <code className="rounded bg-red-50 px-1">VITE_SUPABASE_URL</code> y{' '}
              <code className="rounded bg-red-50 px-1">VITE_SUPABASE_ANON_KEY</code> en{' '}
              <code className="rounded bg-red-50 px-1">apps/web/.env</code>.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleGoogle()}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Continuar con Google
              </button>
              {error ? (
                <p className="mt-3 text-center text-sm text-red-700">{error}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
