'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured, initSupabaseFromConfig } from '@/lib/supabase/client'
import { getGuestUserId, getSavedUsername, saveUsername, setAuthUserId } from '@/lib/identity'

interface AuthUser {
  id: string
  username: string
  email?: string
  isGuest: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, username: string) => Promise<string | null>
  signOut: () => Promise<void>
  updateUsername: (name: string) => void
  isSupabaseEnabled: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(isSupabaseConfigured)

  useEffect(() => {
    async function init() {
      // If build-time vars weren't baked in, fetch from server-side API route (reads runtime env)
      if (!isSupabaseConfigured) {
        try {
          const res = await fetch('/api/config')
          const cfg = await res.json()
          if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
            initSupabaseFromConfig(cfg.supabaseUrl, cfg.supabaseAnonKey)
            setIsSupabaseEnabled(true)
          }
        } catch {
          // Network error or misconfigured — fall through to guest mode
        }
      }

      const supabase = createClient()

      if (!supabase) {
        // Pure guest mode
        setUser({ id: getGuestUserId(), username: getSavedUsername(), isGuest: true })
        setLoading(false)
        return
      }

      // Supabase mode — check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const username = session.user.user_metadata?.username || getSavedUsername() || session.user.email?.split('@')[0] || 'Player'
        setAuthUserId(session.user.id)
        setUser({ id: session.user.id, username, email: session.user.email, isGuest: false })
      } else {
        setUser({ id: getGuestUserId(), username: getSavedUsername(), isGuest: true })
      }
      setLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const username = session.user.user_metadata?.username || getSavedUsername() || 'Player'
          setAuthUserId(session.user.id)
          setUser({ id: session.user.id, username, email: session.user.email, isGuest: false })
        } else {
          setUser({ id: getGuestUserId(), username: getSavedUsername(), isGuest: true })
        }
      })

      return () => subscription.unsubscribe()
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = createClient()
    if (!supabase) return 'Supabase not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<string | null> => {
    const supabase = createClient()
    if (!supabase) return 'Supabase not configured'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (!error) {
      saveUsername(username)
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, username })
      }
    }
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    setUser({ id: getGuestUserId(), username: getSavedUsername(), isGuest: true })
  }, [])

  const updateUsername = useCallback((name: string) => {
    saveUsername(name)
    setUser((prev) => prev ? { ...prev, username: name } : null)
    const supabase = createClient()
    if (supabase) {
      supabase.auth.updateUser({ data: { username: name } })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUsername, isSupabaseEnabled }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
