import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from './env';
import type { Database } from '../types/database.types';

// Create Supabase client (use service role key for server-side operations)
const supabase: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to create a client with user context (for RLS)
export const createSupabaseClientWithAuth = (accessToken: string): SupabaseClient<Database> => {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};

export default supabase;

