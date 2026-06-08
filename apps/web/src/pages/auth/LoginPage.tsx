import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { AndroidApkDownload } from '@/components/pwa/AndroidApkDownload'
import preciosYaLogo from '@/assets/preciosya-logo.png'

export default function LoginPage() {
  const { session, loading, supabaseConfigured, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromLanding = searchParams.get('from') === 'landing'
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (window.location.hash === '#descargar-apk') {
      window.requestAnimationFrame(() => {
        document.getElementById('descargar-apk')?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [])

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
        <div className="flex flex-col items-center gap-6 animate-pulse">
           <img src={preciosYaLogo} alt="Logo" className="h-16 w-16 grayscale opacity-20" />
           <div className="flex flex-col items-center gap-2">
              <div className="h-4 w-32 bg-border-strong rounded-full" />
              <div className="h-3 w-48 bg-border rounded-full" />
           </div>
        </div>
      </div>
    )
  }

  if (session && fromLanding) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 animate-fade-in">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          <div className="mb-10 relative">
             <div className="absolute inset-0 bg-primary-600 blur-3xl opacity-20 animate-pulse" />
             <div className="relative rounded-[2.5rem] bg-primary-600 p-6 shadow-2xl shadow-primary-600/30">
                <img
                  src={preciosYaLogo}
                  alt="Logo"
                  className="h-16 w-16 brightness-0 invert"
                />
             </div>
          </div>
          
          <h1 className="heading-xl">Sessión Iniciada</h1>
          <p className="mt-3 text-sm font-medium text-text-subtle text-balance leading-relaxed">
            Ya tenés una sesión activa con este navegador. Podés entrar directamente al panel.
          </p>

          <div className="surface-card mt-12 w-full p-8 space-y-4 shadow-2xl shadow-primary-600/5">
            <button
              type="button"
              onClick={() => void navigate('/dashboard', { replace: true })}
              className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20 group text-base"
            >
              <span>Ir al Panel de Control</span>
              <ChevronRight size={20} strokeWidth={3} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </button>
            
            <div className="flex items-center gap-4 py-4">
               <div className="h-px flex-1 bg-border" />
               <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em]">O BIEN</span>
               <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              className="btn-secondary w-full h-14 border-none bg-surface-soft shadow-none hover:bg-border/30"
            >
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">Usar otra cuenta</span>
            </button>
          </div>
          <AndroidApkDownload />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 animate-fade-in overflow-hidden relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full" />
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md flex flex-col items-center text-center relative z-10">
        <div className="mb-10 flex items-center justify-center gap-3">
           <div className="rounded-2xl bg-primary-600 p-2.5 shadow-lg shadow-primary-600/20">
              <img src={preciosYaLogo} alt="Logo" className="h-8 w-8 brightness-0 invert" />
           </div>
           <h1 className="text-2xl font-black tracking-tighter text-text-main">
             Precios<span className="text-primary-600">Ya</span>
           </h1>
        </div>

        <div className="space-y-3">
           <h2 className="heading-xl">Protegé tu rentabilidad</h2>
           <p className="text-sm font-medium text-text-subtle text-balance leading-relaxed">
             Iniciá sesión para automatizar tus precios con los índices oficiales del INDEC.
           </p>
        </div>

        <div className="surface-card mt-12 w-full p-8 shadow-2xl shadow-primary-600/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-600" />
          
          {!supabaseConfigured ? (
            <div className="rounded-2xl border border-danger-100 bg-danger-50/50 p-6 flex flex-col items-center gap-4">
               <ShieldAlert size={40} className="text-danger-600 animate-bounce" />
               <p className="text-[10px] font-black text-danger-900 leading-relaxed uppercase tracking-widest">
                 Error Crítico: Faltan variables de entorno para Supabase.
               </p>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => void handleGoogle()}
                className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20 group relative overflow-hidden transition-all active:scale-[0.98] text-base"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <span className="relative flex items-center justify-center gap-4">
                   <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.2 2.56-6.66 2.56-8.09z" fill="#4285F4" />
                         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                         <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                   </div>
                   <span className="text-sm font-black uppercase tracking-widest">Entrar con Google</span>
                </span>
              </button>

              {error && (
                <div className="rounded-xl border border-danger-100 bg-danger-50 p-4 text-center animate-scale-in">
                   <p className="text-[10px] font-black text-danger-700 uppercase tracking-widest leading-tight">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                 <div className="flex items-center gap-2 justify-center">
                    <CheckCircle2 size={12} className="text-primary-600" />
                    <p className="text-[10px] font-extrabold text-text-subtle uppercase tracking-widest">Red Segura via Supabase Auth</p>
                 </div>
                 <p className="text-[9px] font-bold text-text-subtle uppercase tracking-widest leading-relaxed opacity-60">
                    Al continuar, aceptás nuestros términos y condiciones.
                 </p>
              </div>
            </div>
          )}
        </div>

        <AndroidApkDownload />

        <footer className="mt-10 flex flex-col items-center gap-6 animate-slide-up opacity-60">
           <div className="h-12 w-[1px] bg-gradient-to-b from-primary-600 to-transparent" />
           <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.25em]">Desarrollado para</p>
              <p className="text-xs font-black text-text-main tracking-tighter uppercase italic">Comerciantes Argentinos</p>
           </div>
        </footer>
      </div>
    </main>
  )
}
