import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import preciosYaLogo from '@/assets/preciosya-logo.png'

const LANDING_APK_URL = 'https://preciosya-landing.vercel.app/#descargar'

export default function LoginPage() {
  const { session, loading, supabaseConfigured, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromLanding = searchParams.get('from') === 'landing'
  const upgradePro = searchParams.get('upgrade') === 'pro'
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      if (upgradePro) {
        void navigate('/settings?tab=plan&planes=1&checkout=start', { replace: true })
        return
      }
      if (!fromLanding) {
        void navigate('/dashboard', { replace: true })
      }
    }
  }, [loading, session, navigate, fromLanding, upgradePro])

  async function handleGoogle(): Promise<void> {
    setError(null)
    try {
      await signInWithGoogle({
        redirectPath: upgradePro
          ? '/settings?tab=plan&planes=1&checkout=start'
          : '/dashboard',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src={preciosYaLogo} alt="Logo" className="h-14 w-14 opacity-30" />
          <div className="h-3 w-36 rounded-full bg-border" />
        </div>
      </div>
    )
  }

  if (session && fromLanding) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12 animate-fade-in">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <img src={preciosYaLogo} alt="PreciosYa" className="h-10 w-10" />
            <span className="text-2xl font-extrabold tracking-tight text-text-main">
              Precios<span className="text-primary-600">Ya</span>
            </span>
          </div>

          <h1 className="heading-xl">Ya tenés sesión activa</h1>
          <p className="mt-3 text-sm text-text-muted text-balance">
            Podés entrar al panel o cerrar sesión para usar otra cuenta de Google.
          </p>

          <div className="surface-card mt-10 w-full space-y-3 p-6 text-left">
            <button
              type="button"
              onClick={() => void navigate('/dashboard', { replace: true })}
              className="btn-primary w-full"
            >
              Ir al panel
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="btn-secondary w-full"
            >
              Usar otra cuenta
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-1.5 text-xs font-semibold text-text-muted">
          Hecho en Argentina para kioscos y almacenes
        </div>

        <div className="mb-8 flex items-center justify-center gap-3">
          <img src={preciosYaLogo} alt="PreciosYa" className="h-10 w-10" />
          <span className="text-2xl font-extrabold tracking-tight text-text-main">
            Precios<span className="text-primary-600">Ya</span>
          </span>
        </div>

        <h1 className="heading-xl text-balance">
          {upgradePro
            ? 'Suscribite a Pro con Mercado Pago'
            : 'Dejá la libreta: actualizá precios con IPC y cuidá tu margen.'}
        </h1>
        <p className="mt-4 text-base text-text-muted text-balance leading-relaxed">
          {upgradePro
            ? 'Iniciá sesión para completar el pago seguro de $4.500/mes con tarjeta.'
            : 'Iniciá sesión para automatizar tus precios con los índices oficiales del INDEC.'}
        </p>

        <div className="surface-card mt-10 w-full p-6 text-left">
          {!supabaseConfigured ? (
            <div className="rounded-xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
              Faltan <code className="font-mono text-xs">VITE_SUPABASE_URL</code> y{' '}
              <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> en el entorno de la app.
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void handleGoogle()}
                className="btn-primary w-full"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.2 2.56-6.66 2.56-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                Entrar con Google
              </button>

              {error ? (
                <p className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-center text-sm text-danger-700 animate-scale-in">
                  {error}
                </p>
              ) : null}

              <p className="text-center text-xs text-text-subtle">
                Al continuar, aceptás nuestros términos y condiciones.
              </p>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-text-subtle">
          Sin tarjeta · Probá gratis con hasta 30 productos
        </p>
        <p className="mt-3 text-xs text-text-subtle">
          ¿Buscás la app Android?{' '}
          <a
            href={LANDING_APK_URL}
            className="font-bold text-primary-600 underline-offset-2 hover:underline"
          >
            Descargala desde la web
          </a>
        </p>
      </div>
    </main>
  )
}
