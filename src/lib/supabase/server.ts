import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Supabase client for route handlers, signed in as the user whose cookies came with the request. */
export async function serverSupabase() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch { /* called from a place that cannot set cookies; the proxy refreshes them */ }
      },
    },
  });
}
