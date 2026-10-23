/*
 * The browser copy of the app's data. In demo mode it is the only copy. When signed in, it is loaded from
 * Supabase when an app opens and every change is written back (see cloud.ts). Journal entries stay here only.
 */

export const KEYS = { hr: "sikutaki:hr", employee: "sikutaki:karyawan", journal: "sikutaki:jurnal:", counsel: "sikutaki:konseling", owner: "sikutaki:pemilik" } as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* storage blocked */ }
}

export type Result = { ok: true; value?: string } | { ok: false; error: string };
export const fail = (error: string): Result => ({ ok: false, error });

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Removes everything the apps keep in this browser (on sign-out, or when another account signs in). */
export function clearLocal() {
  try {
    for (const k of Object.keys(window.localStorage)) if (k.startsWith("sikutaki:")) window.localStorage.removeItem(k);
    window.sessionStorage.removeItem("sikutaki:asisten");
  } catch { /* storage blocked */ }
}
