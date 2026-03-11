'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
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
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      // Guest mode – use sessionStorage ID
      const guestId = getGuestUserId()
      const username = getSavedUsername()
      setUser({ id: guestId, username, isGuest: true })
      setLoading(false)
      return
    }

    // Supabase mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const username = session.user.user_metadata?.username || getSavedUsername() || session.user.email?.split('@')[0] || 'Player'
        setAuthUserId(session.user.id)
        setUser({ id: session.user.id, username, email: session.user.email, isGuest: false })
      } else {
        // Not logged in → guest mode
        const guestId = getGuestUserId()
        const username = getSavedUsername()
        setUser({ id: guestId, username, isGuest: true })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const username = session.user.user_metadata?.username || getSavedUsername() || 'Player'
        setAuthUserId(session.user.id)
        setUser({ id: session.user.id, username, email: session.user.email, isGuest: false })
      } else {
        const guestId = getGuestUserId()
        setUser({ id: guestId, username: getSavedUsername(), isGuest: true })
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (!error) saveUsername(username)
    return error?.message ?? null
  }, [supabase])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    const guestId = getGuestUserId()
    setUser({ id: guestId, username: getSavedUsername(), isGuest: true })
  }, [supabase])

  const updateUsername = useCallback((name: string) => {
    saveUsername(name)
    setUser((prev) => prev ? { ...prev, username: name } : null)
    if (supabase) {
      supabase.auth.updateUser({ data: { username: name } })
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUsername, isSupabaseEnabled: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
