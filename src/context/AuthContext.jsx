import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Dev-only: skip real Supabase auth so the app can be viewed without a backend.
// Enable by setting VITE_DEV_BYPASS_AUTH=true in .env. Also gated on import.meta.env.DEV
// so it can never activate in a production (Vercel) build, even if the var is set.
export const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
const MOCK_USER = { id: 'dev-user', email: 'dev@local.test' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEV_BYPASS_AUTH ? MOCK_USER : null)
  const [loading, setLoading] = useState(!DEV_BYPASS_AUTH)

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
