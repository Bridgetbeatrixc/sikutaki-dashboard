"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { causesFor, checkinAreas, followUpArea, SCALE_MAX } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";
import { PRACTICE_IDS, programById, programState, REPORT_REASONS, type Slot } from "@/lib/practice";
import { monthKey, rotationIndex, today } from "@/lib/week";
import { endSession, hashPassword, newId, requireRole, verifyPassword } from "../auth";
import { db } from "../db";
import { checkinWindow } from "../employee";

/* Everything an employee writes. Each action checks the session; the demo writes nothing. */

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
/** Practices plus "tenang", the calm-down tool. */
const EXERCISES = [...PRACTICE_IDS, "tenang"];

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

/** HR sees one count per month and kind (psychologist or complementary): each employee counts at most once. */
export async function recordReferral(partnerId: string): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  const [p] = await sql<{ kind: string }[]>`select kind from partners where id = ${partnerId} and company_id = ${user.companyId} and not suspended`;
  if (!p) return fail("Mitra tidak ditemukan.");
  await sql`insert into referrals (company_id, user_id, month, kind) values (${user.companyId}, ${user.id}, ${monthKey(today())}, ${p.kind}) on conflict do nothing`;
  return { ok: true };
}

/** A report suspends a complementary practitioner until HR has looked at it. The reporter is not stored. */
export async function reportPartner(partnerId: string, reason: string): Promise<Result> {
  const user = await employee();
  if (!REPORT_REASONS.includes(reason)) return fail("Pilih alasan laporan.");
  if (!user) return { ok: true };
  const sql = await db();
  const [p] = await sql`select 1 from partners where id = ${partnerId} and company_id = ${user.companyId} and kind = 'komplementer'`;
  if (!p) return fail("Praktisi tidak ditemukan.");
  await sql.begin(async (tx) => {
    await tx`insert into partner_reports (id, partner_id, company_id, reason) values (${newId()}, ${partnerId}, ${user.companyId}, ${reason})`;
    await tx`update partners set suspended = true where id = ${partnerId}`;
  });
  refresh();
  return { ok: true };
}

/* ---------- Programs ---------- */

/** Starts a program. One practical and one routine program can run at the same time. Returns the enrollment id. */
export async function startProgram(programId: string): Promise<Result & { id?: string }> {
  const user = await employee();
  const p = programById(programId);
  if (!p) return fail("Program tidak dikenal.");
  if (!user) return { ok: true, id: `demo-${programId}` };
  const sql = await db();
  const [active] = await sql`select 1 from program_enrollments where user_id = ${user.id} and kind = ${p.kind} and ended_on is null`;
  if (active) return fail(`Kamu sudah punya program ${p.kind} yang berjalan. Hentikan dulu bila ingin menggantinya.`);
  const id = newId();
  await sql`insert into program_enrollments (id, user_id, program, kind, started_on) values (${id}, ${user.id}, ${p.id}, ${p.kind}, ${today()})`;
  refresh();
  return { ok: true, id };
}

export async function setProgramPaused(enrollmentId: string, paused: boolean): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  await sql`update program_enrollments set paused = ${paused} where id = ${enrollmentId} and user_id = ${user.id} and ended_on is null`;
  refresh();
  return { ok: true };
}

/** Ends a program; it counts as completed when every program day had a session. */
export async function stopProgram(enrollmentId: string): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  const [e] = await sql<{ program: string; days: number }[]>`
    select e.program, (select count(distinct s.day)::int from program_sessions s where s.enrollment_id = e.id) as days
    from program_enrollments e where e.id = ${enrollmentId} and e.user_id = ${user.id} and e.ended_on is null`;
  if (!e) return fail("Program tidak ditemukan.");
  const completed = e.days >= (programById(e.program)?.days ?? Infinity);
  await sql`update program_enrollments set ended_on = ${today()}, completed = ${completed}, paused = false where id = ${enrollmentId}`;
  refresh();
  return { ok: true };
}

/** Marks today's session of a program slot done, logs the practice, and closes the program after its last day. */
export async function completeSession(enrollmentId: string, slot: Slot): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  const [e] = await sql<{ program: string; started_on: string; paused: boolean }[]>`
    select program, to_char(started_on, 'YYYY-MM-DD') as started_on, paused from program_enrollments
    where id = ${enrollmentId} and user_id = ${user.id} and ended_on is null`;
  if (!e) return fail("Program tidak ditemukan.");
  const p = programById(e.program);
  if (!p || !p.slots.includes(slot)) return fail("Sesi tidak dikenal.");
  const day = today();
  const done = await sql<{ day: string; slot: Slot }[]>`select to_char(day, 'YYYY-MM-DD') as day, slot from program_sessions where enrollment_id = ${enrollmentId}`;
  const [mood] = await sql<{ mood: number }[]>`select mood from daily_logs where user_id = ${user.id} and day = ${day}`;
  const enrollment = { id: enrollmentId, program: e.program, startedOn: e.started_on, paused: e.paused, sessions: done };
  const practice = programState(enrollment, day, mood?.mood ?? null).slots.find((x) => x.slot === slot)!.practice;
  await sql`insert into program_sessions (enrollment_id, day, slot, practice) values (${enrollmentId}, ${day}, ${slot}, ${practice}) on conflict do nothing`;
  await sql`insert into exercise_logs (user_id, day, exercise) values (${user.id}, ${day}, ${practice}) on conflict do nothing`;
  // Completing a session also resumes a paused program.
  const after = programState({ ...enrollment, paused: false, sessions: [...done, { day, slot }] }, day, mood?.mood ?? null);
  if (after.finished) {
    await sql`update program_enrollments set ended_on = ${day}, completed = true, paused = false where id = ${enrollmentId}`;
  } else if (e.paused) {
    await sql`update program_enrollments set paused = false where id = ${enrollmentId}`;
  }
  refresh();
  return { ok: true };
}

export async function setEnergyOptIn(on: boolean): Promise<Result> {
  const user = await employee();
  if (!user) return { ok: true };
  const sql = await db();
  await sql`update users set energy_opt_in = ${on} where id = ${user.id}`;
  refresh();
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
