/**
 * @deprecated This file is deprecated for security reasons.
 * Please use the new separated client files:
 * - Browser client: import { getSupabaseClient } from '@/lib/clients/browser'
 * - Admin client: import { requireSupabaseAdmin } from '@/lib/clients/admin'
 * 
 * Migration guide: See SUPABASE_SECURITY_MIGRATION.md
 */

import { getSupabaseClient, getSupabaseClientSafe } from './clients/browser'
import { requireSupabaseAdmin } from './clients/admin'

// Legacy exports with deprecation warnings
export const supabase = getSupabaseClient()
export const supabaseAdmin = typeof window === 'undefined' ? requireSupabaseAdmin() : null

// Legacy helper functions
export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClientSafe() !== null
}

// Console warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  DEPRECATION WARNING: Using legacy @/lib/supabase imports.\n' +
    'Please migrate to the new separated client files for improved security.\n' +
    'See SUPABASE_SECURITY_MIGRATION.md for migration instructions.\n' +
    '- Browser: import { getSupabaseClient } from "@/lib/clients/browser"\n' +
    '- Admin: import { requireSupabaseAdmin } from "@/lib/clients/admin"'
  )
}
