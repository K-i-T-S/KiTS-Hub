import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get tenant-aware Supabase client
export function getTenantClient(tenantId: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-tenant-id': tenantId,
      },
    },
  });
}

// Row Level Security helper functions
export const withTenantPolicy = (tenantId: string) => ({
  'tenant_id': tenantId,
});

export const withUserPolicy = (userId: string) => ({
  'user_id': userId,
});

// Real-time subscription helper
export function subscribeToTable<T>(
  table: string,
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE',
  callback: (payload: T) => void,
  filter?: string
) {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
        filter,
      } as any,
      callback
    )
    .subscribe();

  return subscription;
}

// Storage helper
export const uploadFile = async (
  file: File,
  path: string,
  bucket: string = 'uploads'
): Promise<{ data: string | null; error: string | null }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  return { data: data?.path || null, error: error?.message || null };
};

export const getPublicUrl = (path: string, bucket: string = 'uploads'): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

export default supabase;
