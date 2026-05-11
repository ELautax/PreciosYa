import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import preciosYaLogo from '@/assets/preciosya-logo.png'

export default function LoginPage() {
  const { session, loading, supabaseConfigured, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromLanding = searchParams.get('from') === 'landing'
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session && !fromLanding) {
      void navigate('/dashboard', { replace: true })
    }
  }, [loading, session, navigate, fromLanding])

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

  if (session && fromLanding) {
    return (
      <main className="page-shell text-stone-900">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16">
          <img
            src={preciosYaLogo}
            alt="Logo de PreciosYa"
            className="mb-4 h-20 w-20 object-contain"
          />
          <h1 className="text-3xl font-extrabold tracking-tight">
            Precios<span className="text-amber-700">Ya</span>
          </h1>
          <p className="mt-2 text-center text-sm text-stone-600">
            Ya tenés una sesión iniciada en este dispositivo.
          </p>
          <div className="surface-card mt-10 w-full space-y-3 p-6 shadow-sm">
            <button
              type="button"
              onClick={() => void navigate('/dashboard', { replace: true })}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Ir al panel
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              Cerrar sesión y usar otra cuenta
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell text-stone-900">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16">
        <img
          src={preciosYaLogo}
          alt="Logo de PreciosYa"
          className="mb-4 h-20 w-20 object-contain"
        />
        <h1 className="text-3xl font-extrabold tracking-tight">
          Precios<span className="text-amber-700">Ya</span>
        </h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          Iniciá sesión para gestionar precios y listas.
        </p>

        <div className="surface-card mt-10 w-full p-6 shadow-sm">
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
