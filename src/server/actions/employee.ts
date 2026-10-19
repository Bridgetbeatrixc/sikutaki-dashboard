"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { causesFor, checkinAreas, followUpArea, SCALE_MAX } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";
import { monthKey, rotationIndex, today } from "@/lib/week";
import { endSession, hashPassword, requireRole, verifyPassword } from "../auth";
import { db } from "../db";
import { checkinWindow } from "../employee";

/* Everything an employee writes. Each action checks the session; the demo writes nothing. */

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
const EXERCISES = ["napas", "jeda", "tidur", "fokus", "lepas", "tenang"];

async function employee() {
  const s = await requireRole("employee");
  return s.demo ? null : s.user;
}
const refresh = () => revalidatePath(ROUTES.employee.root, "layout");

export async function saveDaily(mood: number, sleep: number): Promise<Result> {
  const user = await employee();
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return fail("Pilih mood dulu.");
  if (!(sleep >= 0 && sleep <= 16)) return fail("Jam tidur tidak valid.");
  if (!user) return { ok: true };
  const sql = await db();
  await sql`insert into daily_logs (user_id, day, mood, sleep) values (${user.id}, ${today()}, ${mood}, ${sleep})
    on conflict (user_id, day) do update set mood = excluded.mood, sleep = excluded.sleep`;
  refresh();
  return { ok: true };
}

export async function submitCheckin(answers: Record<string, number>, causes: string[]): Promise<Result> {
  const user = await employee();
  const sql = user ? await db() : null;
  const day = today();
  let opensOn = 1;
  if (user && sql) [{ checkin_day: opensOn }] = await sql<{ checkin_day: number }[]>`select checkin_day from companies where id = ${user.companyId}`;
  const win = checkinWindow(day, opensOn);
  if (!win.open) return fail("Check-in minggu ini belum dibuka.");
  const areas = checkinAreas(rotationIndex(win.start));
  const clean: Record<string, number> = {};
  for (const a of areas) {
    const v = answers[a];
    if (!Number.isInteger(v) || v < 0 || v > SCALE_MAX) return fail("Jawab semua pertanyaan dulu.");
    clean[a] = v;
  }
  const causeArea = followUpArea(areas, clean);
  const allowed = causeArea ? causesFor(causeArea) : [];
  const picked = [...new Set(causes)].filter((c) => allowed.includes(c));
  if (!user || !sql) return { ok: true };
  const rows = await sql`insert into checkins (user_id, week, company_id, team_id, answers, cause_area, causes)
    values (${user.id}, ${win.start}, ${user.companyId}, ${user.teamId}, ${sql.json(clean)}, ${causeArea}, ${picked})
    on conflict (user_id, week) do nothing returning 1`;
  if (rows.length === 0) return fail("Check-in minggu ini sudah terkirim.");
  refresh();
  return { ok: true };
}

/** Counts toward "opened" in HR's funnel, never who. */
export async function openCheckin(): Promise<void> {
  const user = await employee();
  if (!user) return;
  const sql = await db();
  const [{ checkin_day }] = await sql<{ checkin_day: number }[]>`select checkin_day from companies where id = ${user.companyId}`;
  const win = checkinWindow(today(), checkin_day);
  if (win.open) await sql`insert into checkin_opens (user_id, week) values (${user.id}, ${win.start}) on conflict do nothing`;
}

export async function markExercise(id: string): Promise<Result> {
  const user = await employee();
  if (!EXERCISES.includes(id)) return fail("Latihan tidak dikenal.");
  if (!user) return { ok: true };
  const sql = await db();
  await sql`insert into exercise_logs (user_id, day, exercise) values (${user.id}, ${today()}, ${id}) on conflict do nothing`;
  refresh();
  return { ok: true };
}

/** HR sees one count per month: each employee counts at most once a month. */
export async function recordReferral(partnerId: string): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  const [p] = await sql`select 1 from partners where id = ${partnerId} and company_id = ${user.companyId}`;
  if (!p) return fail("Psikolog tidak ditemukan.");
  await sql`insert into referrals (company_id, user_id, month) values (${user.companyId}, ${user.id}, ${monthKey(today())}) on conflict do nothing`;
  return { ok: true };
}

export async function completeOnboarding(): Promise<void> {
  const user = await employee();
  if (user) {
    const sql = await db();
    await sql`update users set onboarded = true where id = ${user.id}`;
  }
  redirect(ROUTES.employee.home);
}

export async function updateProfile(name: string, teamId: string): Promise<Result> {
  const user = await employee();
  const n = name.trim();
  if (n.length < 2) return fail("Isi nama.");
  if (!user) return { ok: true };
  const sql = await db();
  const [team] = await sql`select 1 from teams where id = ${teamId} and company_id = ${user.companyId}`;
  if (!team) return fail("Pilih divisi.");
  await sql`update users set name = ${n.slice(0, 80)}, team_id = ${teamId} where id = ${user.id}`;
  refresh();
  return { ok: true };
}

export async function changePassword(current: string, next: string): Promise<Result> {
  const s = await requireRole("employee").catch(() => requireRole("hr"));
  if (s.demo) return { ok: true };
  if (next.length < 8) return fail("Kata sandi baru minimal 8 karakter.");
  const sql = await db();
  const [row] = await sql<{ password_hash: string }[]>`select password_hash from users where id = ${s.user.id}`;
  if (!row || !(await verifyPassword(current, row.password_hash))) return fail("Kata sandi lama salah.");
  await sql`update users set password_hash = ${await hashPassword(next)} where id = ${s.user.id}`;
  return { ok: true };
}

/** Deletes the account with every daily note, check-in and exercise log (UU PDP: right to erasure). */
export async function deleteAccount(password: string): Promise<Result> {
  const user = await employee();
  if (!user) return fail("Akun demo tidak bisa dihapus.");
  const sql = await db();
  const [row] = await sql<{ password_hash: string }[]>`select password_hash from users where id = ${user.id}`;
  if (!row || !(await verifyPassword(password, row.password_hash))) return fail("Kata sandi salah.");
  await sql`delete from users where id = ${user.id}`;
  await endSession();
  redirect(`${ROUTES.login}?hapus=1`);
}
