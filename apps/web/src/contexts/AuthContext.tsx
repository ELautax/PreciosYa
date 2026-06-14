import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'

type AuthContextValue = {
  session: Session | null
  loading: boolean
  supabaseConfigured: boolean
  signInWithGoogle: (options?: { redirectPath?: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const syncedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.access_token || !session.user?.id) {
      syncedUserId.current = null
      return
    }
    if (syncedUserId.current === session.user.id) return
    syncedUserId.current = session.user.id

    void fetch(`${env.VITE_API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ accessToken: session.access_token }),
    }).catch(() => {})
  }, [session])

  const signInWithGoogle = useCallback(async (options?: { redirectPath?: string }) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const path = options?.redirectPath ?? '/dashboard'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    syncedUserId.current = null
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      session,
      loading,
      supabaseConfigured: Boolean(supabase),
      signInWithGoogle,
      signOut,
    }),
    [session, loading, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
