import "server-only";
import { SUPABASE_KEY, SUPABASE_URL, supabaseReady } from "@/lib/supabase/config";
import type { Dashboard } from "./model";

/** Calls a BrainQ database function. The tables are closed to the browser; these functions return aggregates only. */
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!supabaseReady) throw new Error("Supabase belum diatur.");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Supabase ${res.status}`);
  return body as T;
}

export const getDashboard = (code: string) => rpc<Dashboard | null>("bq_dashboard", { p_code: code });

export const getCompany = (code: string) =>
  rpc<{ name: string; teams: { id: string; name: string }[] } | null>("bq_company", { p_code: code });

export const submitResult = (code: string, team: string, p: Record<string, unknown>) =>
  rpc<boolean>("bq_submit", { p_code: code, p_team: team, p });
