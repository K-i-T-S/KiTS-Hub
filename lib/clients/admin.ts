/**
 * Admin Supabase Client - Server Side Only
 * 
 * This client is designed for server-side usage with service role key.
 * It includes enhanced security measures and should NEVER be exposed to clients.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { supabaseConfig, validateEnvironment } from '@/lib/env-config-simple'

// Only load environment variables on server side
if (typeof window === 'undefined') {
  try {
    import('dotenv').then(dotenv => {
      dotenv.config({ path: '.env.local' })
    })
  } catch (error) {
    // dotenv not available, continue without it
  }
}

// Environment variables with validation - only on server side
if (typeof window === 'undefined' && !validateEnvironment()) {
  throw new Error('Missing required Supabase environment variables')
}

// Singleton pattern with lazy initialization
let supabaseAdminInstance: SupabaseClient | null = null

/**
 * Get the Supabase admin client instance
 * Implements singleton pattern and includes security configurations
 * WARNING: This client bypasses RLS and should only be used server-side
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  // Ensure we're on server side
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client can only be used server-side')
  }
  
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        persistSession: false, // Don't persist admin sessions
        autoRefreshToken: false, // Don't auto-refresh admin tokens
        detectSessionInUrl: false, // Don't detect sessions in URL
      },
      global: {
        headers: {
          'X-Client-Info': 'kits-hub-admin/1.0.0',
          'X-Admin-Client': 'true', // Mark as admin client for monitoring
        },
      },
    })
  }
  return supabaseAdminInstance
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSupabaseAdminClient() instead
 */
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdminClient() : null

/**
 * Check if Supabase admin is properly configured
 */
export const isSupabaseAdminConfigured = (): boolean => {
  // Only check configuration on server side
  if (typeof window !== 'undefined') {
    return false
  }
  return !!(supabaseConfig.url && supabaseConfig.serviceRoleKey)
}

/**
 * Get Supabase admin client with additional error handling
 */
export const getSupabaseAdminClientSafe = (): SupabaseClient | null => {
  try {
    return getSupabaseAdminClient()
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error)
    return null
  }
}

/**
 * Helper function to ensure admin client is available (throws if not)
 * Use this in API routes where admin access is required
 */
export const requireSupabaseAdmin = (): SupabaseClient => {
  const client = getSupabaseAdminClientSafe()
  if (!client) {
    throw new Error('Supabase admin client not configured. Check environment variables.')
  }
  return client
}

/**
 * Security check to ensure admin client is not used in browser context
 */
export const validateServerSideUsage = (): void => {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client can only be used server-side')
  }
}

export type { Database }
