"use server";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { AREAS, MIN_GROUP, NOTE_TYPES, type NoteType } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";
import { createResetToken, newId, requireRole } from "../auth";
import { db } from "../db";

/* Everything HR writes. Each action checks the session and the company; the demo writes nothing. */

export type Result = { ok: true; value?: string } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
const DEMO: Result = { ok: false, error: "Ini mode demo, perubahan tidak disimpan. Daftar untuk memakai Sikutaki dengan data perusahaanmu." };

async function hr() {
  const s = await requireRole("hr");
  return s.demo ? null : s.user;
}
const refresh = () => revalidatePath(ROUTES.hr.root, "layout");

async function ownTeam(companyId: string, teamId: string) {
  const sql = await db();
  const [t] = await sql`select 1 from teams where id = ${teamId} and company_id = ${companyId}`;
  return Boolean(t);
}

export async function addNote(team: string, type: NoteType, area: string, text: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const t = text.trim();
  if (!t) return fail("Tulis isi catatan.");
  if (!NOTE_TYPES.includes(type)) return fail("Jenis catatan tidak dikenal.");
  if (area && !AREAS.some((a) => a.id === area)) return fail("Area tidak dikenal.");
  if (!(await ownTeam(user.companyId, team))) return fail("Divisi tidak ditemukan.");
  const sql = await db();
  await sql`insert into notes (id, company_id, team_id, area, type, text, by_name)
    values (${newId()}, ${user.companyId}, ${team}, ${area || null}, ${type}, ${t.slice(0, 2000)}, ${user.name})`;
  refresh();
  return { ok: true };
}

export async function deleteNote(id: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const sql = await db();
  await sql`delete from notes where id = ${id} and company_id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

export async function updateCompany(name: string, industry: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  if (name.trim().length < 2) return fail("Isi nama perusahaan.");
  const sql = await db();
  await sql`update companies set name = ${name.trim().slice(0, 120)}, industry = ${industry.trim().slice(0, 60)} where id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

export async function addTeam(name: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const n = name.trim();
  if (!n) return fail("Tulis nama divisi.");
  const sql = await db();
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from teams where company_id = ${user.companyId}`;
  if (count >= 50) return fail("Maksimal 50 divisi.");
  await sql`insert into teams (id, company_id, name) values (${newId()}, ${user.companyId}, ${n.slice(0, 60)})`;
  refresh();
  return { ok: true };
}

export async function renameTeam(id: string, name: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  if (!name.trim()) return fail("Tulis nama divisi.");
  const sql = await db();
  await sql`update teams set name = ${name.trim().slice(0, 60)} where id = ${id} and company_id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

/** Only an empty division can be removed, so nobody loses their division silently. */
export async function deleteTeam(id: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const sql = await db();
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from users where team_id = ${id} and company_id = ${user.companyId}`;
  if (count > 0) return fail("Divisi ini masih punya anggota. Pindahkan anggotanya dulu, lewat profil masing-masing.");
  await sql`delete from teams where id = ${id} and company_id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

export async function saveSchedule(day: number, reminder: boolean): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  if (!Number.isInteger(day) || day < 1 || day > 5) return fail("Pilih hari Senin sampai Jumat.");
  const sql = await db();
  await sql`update companies set checkin_day = ${day}, reminder = ${reminder} where id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

export async function savePrivacy(minGroup: number, retentionMonths: number): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  if (!Number.isInteger(minGroup) || minGroup < MIN_GROUP || minGroup > 15) return fail("Ukuran kelompok minimal 5 sampai 15 orang.");
  if (![12, 24, 36].includes(retentionMonths)) return fail("Pilih 12, 24, atau 36 bulan.");
  const sql = await db();
  await sql`update companies set min_group = ${minGroup}, retention_months = ${retentionMonths} where id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

/** A contact must be a web link (booking page, WhatsApp link) or an email address. */
function normalizeContact(raw: string): string | null {
  const c = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return `mailto:${c}`;
  if (/^\+?\d[\d\s-]{7,}$/.test(c)) return `https://wa.me/${c.replace(/\D/g, "").replace(/^0/, "62")}`;
  try {
    const u = new URL(c);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch { return null; }
}

export async function addPartner(p: { name: string; focus: string; schedule: string; contact: string }): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  if (p.name.trim().length < 2) return fail("Isi nama psikolog atau layanan.");
  const contact = normalizeContact(p.contact);
  if (!contact) return fail("Kontak harus berupa tautan (https://...), nomor WhatsApp, atau alamat email.");
  const sql = await db();
  await sql`insert into partners (id, company_id, name, focus, schedule, contact)
    values (${newId()}, ${user.companyId}, ${p.name.trim().slice(0, 120)}, ${p.focus.trim().slice(0, 120)}, ${p.schedule.trim().slice(0, 120)}, ${contact})`;
  refresh();
  return { ok: true };
}

export async function removePartner(id: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const sql = await db();
  await sql`delete from partners where id = ${id} and company_id = ${user.companyId}`;
  refresh();
  return { ok: true };
}

/** A one-time link HR passes to an employee who forgot their password. Returns the path. */
export async function createResetLink(email: string): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const sql = await db();
  const [target] = await sql<{ id: string }[]>`select id from users where email = ${email.trim().toLowerCase()} and company_id = ${user.companyId}`;
  if (!target) return fail("Email ini tidak terdaftar di perusahaanmu.");
  const token = await createResetToken(target.id);
  return { ok: true, value: `/reset/${token}` };
}

export async function regenerateInvite(): Promise<Result> {
  const user = await hr();
  if (!user) return DEMO;
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const code = Array.from({ length: 8 }, () => abc[randomInt(abc.length)]).join("");
  const sql = await db();
  await sql`update companies set invite_code = ${code} where id = ${user.companyId}`;
  refresh();
  return { ok: true, value: code };
}
