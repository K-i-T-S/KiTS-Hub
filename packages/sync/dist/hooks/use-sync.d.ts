import { SupabaseClient } from '@supabase/supabase-js';
import { UseSyncResult, UseRealtimeSyncResult, SyncConfig } from '../types';
export declare function useSync<T extends Record<string, any>>(supabase: SupabaseClient, config: SyncConfig): UseSyncResult<T>;
export declare function useRealtimeSync<T extends Record<string, any>>(supabase: SupabaseClient, config: SyncConfig): UseRealtimeSyncResult<T>;
