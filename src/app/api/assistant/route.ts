import { NextResponse } from "next/server";
import { systemPrompt, type AssistantContext } from "@/lib/assistant";
import { supabaseReady } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";
import { askGemini, GeminiError, type ChatTurn } from "@/server/gemini";

/*
 * POST /api/assistant: the employee app's AI assistant. Only for signed-in accounts, so the Gemini key
 * cannot be used by anyone on the internet. The system prompt is built here from the app context.
 */

const MAX_TURNS = 12;
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const list = <T,>(v: unknown, max: number, f: (x: Record<string, unknown>) => T | null): T[] =>
  Array.isArray(v) ? v.slice(0, max).flatMap((x) => (x && typeof x === "object" ? [f(x as Record<string, unknown>)].filter((y): y is T => y !== null) : [])) : [];
const strings = (v: unknown, max: number, len: number) => (Array.isArray(v) ? v.slice(0, max).map((x) => str(x, len)).filter(Boolean) : []);
const num = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : null);
const int = (v: unknown, min: number, max: number) => { const n = num(v, min, max); return n === null ? null : Math.round(n); };

/** Keeps only what the prompt uses, in the expected shapes and sizes. */
function cleanContext(raw: unknown): AssistantContext {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const scores = (v: unknown) => v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v as Record<string, unknown>).slice(0, 20).flatMap(([k, x]) => { const n = int(x, 0, 4); return n === null ? [] : [[k.slice(0, 40), n]]; }))
    : null;
  return {
    name: str(c.name, 40) || "teman",
    energy: c.energy === true,
    days: list(c.days, 7, (d) => { const mood = int(d.mood, 1, 5); return mood ? { day: str(d.day, 10), mood, sleep: num(d.sleep, 0, 16) ?? 0 } : null; }),
    todayMood: int(c.todayMood, 1, 5),
    answers: scores(c.answers),
    previous: scores(c.previous),
    causes: strings(c.causes, 8, 60),
    causeNote: str(c.causeNote, 200).replace(/["\n]/g, " "),
    recent: strings(c.recent, 10, 60),
    opener: str(c.opener, 400).replace(/"/g, "'"),
    programs: list(c.programs, 2, (p) => ({
      id: str(p.id, 40), day: int(p.day, 0, 400) ?? 0, days: int(p.days, 1, 400) ?? 1, paused: p.paused === true,
      sessions: list(p.sessions, 4, (s) => ({ slot: str(s.slot, 20), practice: str(s.practice, 40), done: s.done === true })),
    })),
    doneToday: strings(c.doneToday, 20, 40),
    requests: strings(c.requests, 3, 60),
  };
}

function cleanTurns(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null;
  const turns = raw.slice(-MAX_TURNS).flatMap((t) => {
    const x = (t ?? {}) as Record<string, unknown>;
    const role = x.role === "model" ? "model" : x.role === "user" ? "user" : null;
    const text = str(x.text, role === "user" ? 1000 : 4000).trim();
    return role && text ? [{ role, text } as ChatTurn] : [];
  });
  // Gemini expects the conversation to start with the user and end with the user's new message.
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.length && turns[turns.length - 1].role === "user" ? turns : null;
}

export async function POST(request: Request) {
  if (!supabaseReady) return fail("Asisten butuh akun: server belum terhubung ke Supabase.", 503);
  const supabase = await serverSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return fail("Masuk dengan akun karyawan untuk memakai asisten. Mode demo tidak memakai asisten.", 401);

  const body = (await request.json().catch(() => null)) as { context?: unknown; turns?: unknown } | null;
  const turns = cleanTurns(body?.turns);
  if (!turns) return fail("Pesan tidak valid.", 400);

  try {
    const text = await askGemini(systemPrompt(cleanContext(body?.context)), turns);
    return NextResponse.json({ text });
  } catch (e) {
    if (e instanceof GeminiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Terjadi kesalahan di server.", 500);
  }
}
