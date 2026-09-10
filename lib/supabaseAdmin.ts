import { createClient } from '@supabase/supabase-js';

// Server-only client using the service role key, which bypasses Row Level
// Security. Never import this file into a client component.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase Storage is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, serviceKey);
}
