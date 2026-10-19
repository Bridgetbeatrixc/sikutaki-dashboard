"use server";
import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/paths";
import { consumeResetToken, endSession, hashPassword, newId, startDemo, startSession, verifyPassword, type Role } from "../auth";
import { db, hasDatabase } from "../db";

export type FormState = { error?: string; fields?: Record<string, string> } | undefined;

const NO_DB = "Server Sikutaki belum terhubung ke database, jadi akun belum bisa dibuat. Coba demo dulu, atau hubungi kami.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
/** Echo the form back on error, without passwords. */
const keep = (f: FormData) => Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === "string" && !k.includes("password") && !k.startsWith("$")).map(([k, v]) => [k, String(v)]));

/** 8 characters without look-alikes (0/O, 1/I/L). */
function inviteCode() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => abc[randomInt(abc.length)]).join("");
}

function checkAccount(f: FormData): string | null {
  const name = str(f, "name"), email = str(f, "email").toLowerCase(), password = String(f.get("password") ?? "");
  if (name.length < 2) return "Isi nama lengkap.";
  if (!EMAIL.test(email)) return "Alamat email tidak valid.";
  if (password.length < 8) return "Kata sandi minimal 8 karakter.";
  return null;
}

async function emailTaken(email: string) {
  const sql = await db();
  const [row] = await sql`select 1 from users where email = ${email}`;
  return Boolean(row);
}

/** HR creates the organisation, its divisions and their own account. */
export async function signupHr(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDatabase()) return { error: NO_DB, fields: keep(f) };
  const bad = checkAccount(f);
  const company = str(f, "company");
  const divisions = [...new Set(str(f, "divisions").split(/[\n,]/).map((d) => d.trim()).filter(Boolean))].slice(0, 50);
  if (bad) return { error: bad, fields: keep(f) };
  if (company.length < 2) return { error: "Isi nama perusahaan.", fields: keep(f) };
  if (divisions.length === 0) return { error: "Tulis minimal satu divisi.", fields: keep(f) };
  const email = str(f, "email").toLowerCase();
  if (await emailTaken(email)) return { error: "Email ini sudah terdaftar. Silakan masuk.", fields: keep(f) };

  const sql = await db();
  const companyId = newId(), userId = newId();
  const hash = await hashPassword(String(f.get("password")));
  await sql.begin(async (tx) => {
    await tx`insert into companies (id, name, industry, invite_code) values (${companyId}, ${company}, ${str(f, "industry")}, ${inviteCode()})`;
    for (const d of divisions) await tx`insert into teams (id, company_id, name) values (${newId()}, ${companyId}, ${d.slice(0, 60)})`;
    await tx`insert into users (id, company_id, role, name, email, password_hash, onboarded) values (${userId}, ${companyId}, 'hr', ${str(f, "name")}, ${email}, ${hash}, true)`;
  });
  await startSession(userId);
  redirect(ROUTES.hr.root);
}

/** An employee joins with the company's invite code. */
export async function signupEmployee(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDatabase()) return { error: NO_DB, fields: keep(f) };
  const bad = checkAccount(f);
  if (bad) return { error: bad, fields: keep(f) };
  const sql = await db();
  const code = str(f, "code").toUpperCase();
  const [company] = await sql<{ id: string }[]>`select id from companies where invite_code = ${code}`;
  if (!company) return { error: "Kode undangan tidak ditemukan. Minta kode terbaru ke HR.", fields: keep(f) };
  const [team] = await sql<{ id: string }[]>`select id from teams where id = ${str(f, "team")} and company_id = ${company.id}`;
  if (!team) return { error: "Pilih divisimu.", fields: keep(f) };
  const email = str(f, "email").toLowerCase();
  if (await emailTaken(email)) return { error: "Email ini sudah terdaftar. Silakan masuk.", fields: keep(f) };

  const userId = newId();
  await sql`insert into users (id, company_id, team_id, role, name, email, password_hash)
    values (${userId}, ${company.id}, ${team.id}, 'employee', ${str(f, "name")}, ${email}, ${await hashPassword(String(f.get("password")))})`;
  await startSession(userId);
  redirect(ROUTES.employee.root);
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDatabase()) return { error: NO_DB, fields: keep(f) };
  const email = str(f, "email").toLowerCase(), password = String(f.get("password") ?? "");
  const sql = await db();
  const [user] = await sql<{ id: string; role: Role; password_hash: string }[]>`select id, role, password_hash from users where email = ${email}`;
  if (!user || !(await verifyPassword(password, user.password_hash))) return { error: "Email atau kata sandi salah.", fields: keep(f) };
  await startSession(user.id);
  redirect(user.role === "hr" ? ROUTES.hr.root : ROUTES.employee.home);
}

export async function logout() {
  await endSession();
  redirect(ROUTES.login);
}

export async function enterDemo(role: Role) {
  await endSession();
  await startDemo(role);
  redirect(role === "hr" ? ROUTES.hr.root : ROUTES.employee.root);
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDatabase()) return { error: NO_DB };
  const password = String(f.get("password") ?? "");
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== String(f.get("password2") ?? "")) return { error: "Kedua kata sandi tidak sama." };
  const ok = await consumeResetToken(str(f, "token"), password);
  if (!ok) return { error: "Tautan ini sudah dipakai atau kedaluwarsa. Minta tautan baru ke HR." };
  redirect(`${ROUTES.login}?reset=1`);
}
