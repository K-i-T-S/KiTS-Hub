'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }

      if (event === 'SIGNED_IN' && session?.user) {
        // Track login event
        await trackAuthEvent('login', session.user.id)
      } else if (event === 'SIGNED_OUT') {
        // Track logout event
        await trackAuthEvent('logout')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackAuthEvent = async (action: string, userId?: string) => {
    if (!supabase) return

    try {
      // Get visitor info from localStorage or create new visitor tracking
      const sessionId = localStorage.getItem('visitor_session_id')
      
      if (sessionId) {
        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: action as any,
          table_name: 'auth',
          ip_address: null, // You can get this from a service if needed
          user_agent: navigator.userAgent
        })
      }
    } catch (error) {
      console.error('Error tracking auth event:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { name: 'AuthError', message: 'Supabase not configured' } as AuthError, data: null }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user) {
      // Fetch user profile after successful login
      await fetchProfile(data.user.id)
    }
    
    return { error, data }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: { name: 'AuthError', message: 'Supabase not configured' } as AuthError }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: { name: 'AuthError', message: 'Supabase not configured' } as AuthError }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { name: 'Error', message: 'No user logged in' } as AuthError }
    if (!supabase) return { error: { name: 'Error', message: 'Supabase not configured' } as AuthError }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile((prev: Profile | null) => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
