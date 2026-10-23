import { NextResponse } from "next/server";
import { submitResult } from "@/features/brainq/api";
import { QUESTION_IDS, ROLES } from "@/features/brainq/questions";

/** BrainQ's scoring engine (BrainQ Intelligence Core) on the BrainQ site. */
const SCORE_URL = "https://sikutaki-brainq.vercel.app/api/score";

type Body = { code?: string; team?: string; role?: string; answers?: Record<string, number>; concerns?: string[] };

/**
 * Scores an employee's answers with BrainQ, stores only the numbers the team dashboard needs (no identity,
 * no safety answers), and returns the personal result to the employee.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { code, team, answers = {} } = body;
  const role = ROLES.some((r) => r.id === body.role) ? body.role : "personal";
  if (!code || !team) return NextResponse.json({ error: "Pilih tim Anda dulu." }, { status: 400 });
  const ids = ["demand", ...QUESTION_IDS];
  if (!ids.every((id) => Number.isInteger(answers[id]) && answers[id] >= 1 && answers[id] <= 5)) {
    return NextResponse.json({ error: "Masih ada pertanyaan yang belum dijawab." }, { status: 400 });
  }
  const clean = Object.fromEntries(ids.map((id) => [id, answers[id]]));
  const concerns = (body.concerns ?? []).filter((c) => typeof c === "string").slice(0, 3);

  let r;
  try {
    const res = await fetch(SCORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, concerns, redFlags: [], answers: clean }),
      cache: "no-store",
    });
    r = await res.json();
    if (!res.ok) return NextResponse.json({ error: r?.error ?? "BrainQ gagal menghitung hasil." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "BrainQ sedang tidak bisa dihubungi. Coba lagi sebentar." }, { status: 502 });
  }

  const brain6 = Object.fromEntries((r.brain6 as { name: string; score: number }[]).map((b) => [b.name.toLowerCase(), b.score]));
  try {
    await submitResult(code, team, {
      score: r.headline.score,
      ...brain6,
      fog_level: r.fogRisk.level,
      bottleneck: r.bottleneck.title,
      readiness_demand: r.readiness.demand,
      readiness_current: r.readiness.current,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hasil gagal disimpan." }, { status: 400 });
  }

  return NextResponse.json({
    score: r.headline.score,
    headline: r.headline.sentence,
    brain6: r.brain6,
    fog: r.fogRisk,
    bottleneck: r.bottleneck,
    nextMove: r.nextMove,
    prescription: r.prescription,
  });
}
