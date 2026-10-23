import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseReady } from "./config";

let client: SupabaseClient | null = null;

/** The browser's Supabase client. The session lives in cookies, so the server and the middleware see it too. */
export function supabase(): SupabaseClient {
  if (!supabaseReady) throw new Error("Supabase belum diatur: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
