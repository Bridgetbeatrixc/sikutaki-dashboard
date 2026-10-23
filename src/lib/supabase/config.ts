/*
 * Supabase settings, read from the environment (Vercel: Settings > Environment Variables).
 * Both values are public by design: the database is protected by row level security (supabase/schema.sql).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** False until both variables are set; the site then runs in demo mode only. */
export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Set by /demo/hr and /demo/karyawan: the apps open with the sample company and keep data in the browser. */
export const DEMO_COOKIE = "sikutaki-demo";
