import axios from 'axios'
import { useMemo } from 'react'

import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'

import { useAuth } from '@/contexts/AuthContext'

export function useApiClient() {
  const { session } = useAuth()

  return useMemo(() => {
    const client = axios.create({
      baseURL: env.VITE_API_URL,
      headers: { 'Content-Type': 'application/json' },
    })

    client.interceptors.request.use((config) => {
      const token = session?.access_token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401 &&
          supabase
        ) {
          await supabase.auth.signOut()
        }
        return Promise.reject(error)
      },
    )

    return client
  }, [session?.access_token])
}
