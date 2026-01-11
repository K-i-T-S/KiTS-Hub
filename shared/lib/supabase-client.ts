import { createClient } from '@supabase/supabase-js'

// Supabase configuration from kits-hub-v2.0 (hardcoded for reliability)
const supabaseUrl = 'https://sgopuwsjgfvjsxhfhlsj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb3B1d3NqZ2Z2anN4aGZobHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTA0MDEsImV4cCI6MjA4Mjg2NjQwMX0.pb95f26GSeuTomko24nx3tijNL54lDJ0fQmB2TBg98s'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb3B1d3NqZ2Z2anN4aGZobHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI5MDQwMSwiZXhwIjoyMDgyODY2NDAxfQ.qEhyw12ueU_x4HoQOilRksYoMA72ERHrnFr9b-0K5Ys'

// Validate environment
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper functions for tenant context
export const getTenantContext = () => {
  const tenantId = 'demo-tenant-001' // Hardcoded for demo
  return { tenantId }
}

// Enhanced client with tenant context
export const createTenantClient = (tenantId?: string) => {
  const client = createClient(supabaseUrl, supabaseAnonKey)
  
  // Add tenant context to all requests
  const originalRpc = client.rpc
  client.rpc = (fn, params) => {
    return originalRpc(fn, { ...params, tenant_id: tenantId || getTenantContext().tenantId })
  }
  
  return client
}

export default supabase
