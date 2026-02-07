import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Storage bucket for document uploads. Set VITE_STORAGE_BUCKET to override (default: documents). */
export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET ?? 'documents';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { url: supabaseUrl, key: !!supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
