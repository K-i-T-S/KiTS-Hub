'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError, createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/lib/env-config-simple'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Initialize Supabase client with proper error handling
  const [supabase] = useState(() => {
    try {
      if (!supabaseConfig.url || !supabaseConfig.anonKey) {
        throw new Error('Missing required Supabase environment variables')
      }
      
      const client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
      
      console.log('✅ Supabase client initialized')
      return client
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      return null
    }
  })

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { success: false, error: (error as Error).message }
      }
      
      if (data.user) {
        setUser(data.user)
        setSession(data.session)
        
        // Fetch the user's profile from the profiles table
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Profile fetch error after sign in:', profileError)
          setProfile(null)
        } else {
          setProfile(profile)
          console.log('✅ Profile loaded after sign in:', profile)
        }
        
        console.log('✅ User signed in successfully')
        return { success: true, error: null }
      }
      
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    
    try {
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) {
        return { success: false, error: (error as Error).message }
      }
      
      if (data.user) {
        setUser(data.user)
        setSession(data.session)
        
        // Fetch the user's profile from the profiles table
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Profile fetch error after sign up:', profileError)
          setProfile(null)
        } else {
          setProfile(profile)
          console.log('✅ Profile loaded after sign up:', profile)
        }
        
        console.log('✅ User signed up successfully')
        return { success: true, error: null }
      }
      
      return { success: false, error: 'Registration failed' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not initialized')
      }
      
      const { error } = await client.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error.message)
      }
      
      setUser(null)
      setProfile(null)
      setSession(null)
      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ Sign out exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not initialized')
      }
      
      const { error } = await client.auth.updateUser({
        email: email,
        password: password
      })
      
      if (error) {
        return { success: false, error: (error as Error).message }
      }
      
      console.log('✅ Password reset successfully')
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    setLoading(true)
    
    try {
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: (error as Error).message }
      }
      
      if (data) {
        setProfile(data)
        console.log('✅ Profile updated successfully')
        return { success: true, error: null }
      }
      
      return { success: false, error: 'Update failed' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  // Auto-initialize session on mount
  useEffect(() => {
    const client = supabase
    if (!client) return
    
    const initializeSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession()
        if (session) {
          setUser(session.user)
          setSession(session)
          
          // Fetch the user's profile from the profiles table
          const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            // Set profile to null if fetch fails
            setProfile(null)
          } else {
            setProfile(profile)
            console.log('✅ Profile loaded:', profile)
          }
          
          console.log('✅ Session restored')
        }
      } catch (error) {
        console.error('❌ Session initialization error:', error)
      }
    }
    
    initializeSession()
  }, [supabase])

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
