import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized clients to prevent build-time crashes when env vars are not set.

let _supabaseAdmin: SupabaseClient | null = null;
let _supabase: SupabaseClient | null = null;

/**
 * Server-side Supabase client (uses service role key for full DB access).
 * Used in API routes and cron jobs for INSERT/UPDATE/DELETE operations.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase admin client tidak bisa dibuat. " +
        "Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah di-set di .env.local."
      );
    }

    _supabaseAdmin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
    });
  }
  return _supabaseAdmin;
}

/**
 * Public Supabase client (uses anon key for client-safe read operations).
 * Used for public-facing queries that respect Row Level Security.
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase public client tidak bisa dibuat. " +
        "Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah di-set di .env.local."
      );
    }

    _supabase = createClient(url, key);
  }
  return _supabase;
}
