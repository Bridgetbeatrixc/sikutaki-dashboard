/*
 * Frontend-only version: everything is kept in this browser's localStorage. Nothing is sent to a server,
 * except the AI assistant's messages, which go to the Gemini API.
 */

export const KEYS = { hr: "sikutaki:hr", employee: "sikutaki:karyawan", journal: "sikutaki:jurnal:", gemini: "sikutaki:gemini" } as const;

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
