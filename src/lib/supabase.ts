import { createClient } from '@supabase/supabase-js';

/** Lexora Supabase project (do not hardcode URLs; use env). */
export const EXPECTED_SUPABASE_PROJECT_REF = 'ttzykwwaruxcstftanae';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Storage bucket for document uploads. Set VITE_STORAGE_BUCKET to override (default: documents). */
export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET ?? 'documents';

/** Project ref parsed from VITE_SUPABASE_URL (for dev guard only). */
export const SUPABASE_PROJECT_REF =
  supabaseUrl && typeof supabaseUrl === 'string'
    ? (() => {
        try {
          return new URL(supabaseUrl).hostname.replace(/\.supabase\.co$/, '') || '';
        } catch {
          return '';
        }
      })()
    : '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { url: supabaseUrl, key: !!supabaseAnonKey });
}

if (import.meta.env.DEV && supabaseUrl) {
  console.log('[Lexora] Supabase URL host:', supabaseUrl.replace(/^https?:\/\//, '').split('/')[0]);
  console.log('[Lexora] Supabase project ref:', SUPABASE_PROJECT_REF || '(none)');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
