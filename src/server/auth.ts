import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { cache } from "react";
import { db, hasDatabase } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "sk_session";
/** The demo opens without an account: "hr" or "employee". */
export const DEMO_COOKIE = "sk_demo";
const SESSION_DAYS = 30;

export type Role = "hr" | "employee";
export type SessionUser = { id: string; name: string; email: string; role: Role; companyId: string; teamId: string | null; onboarded: boolean };
export type Viewer = { kind: "demo"; role: Role } | { kind: "user"; role: Role; user: SessionUser } | null;

export const newId = (bytes = 12) => randomBytes(bytes).toString("base64url");
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge,
});

export async function startSession(userId: string) {
  const sql = await db();
  const token = newId(32);
  await sql`insert into sessions (token_hash, user_id, expires_at) values (${sha256(token)}, ${userId}, now() + ${`${SESSION_DAYS} days`}::interval)`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(SESSION_DAYS * 86400));
  jar.delete(DEMO_COOKIE);
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && hasDatabase()) {
    const sql = await db();
    await sql`delete from sessions where token_hash = ${sha256(token)}`;
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(DEMO_COOKIE);
}

export async function startDemo(role: Role) {
  const jar = await cookies();
  jar.set(DEMO_COOKIE, role, cookieOptions(7 * 86400));
}

/** Who is looking: a signed-in user, the demo, or nobody. Cached for one request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && hasDatabase()) {
    const sql = await db();
    const [row] = await sql<{ id: string; name: string; email: string; role: Role; company_id: string; team_id: string | null; onboarded: boolean }[]>`
      select u.id, u.name, u.email, u.role, u.company_id, u.team_id, u.onboarded
      from sessions s join users u on u.id = s.user_id
      where s.token_hash = ${sha256(token)} and s.expires_at > now()`;
    if (row) {
      return { kind: "user", role: row.role, user: { id: row.id, name: row.name, email: row.email, role: row.role, companyId: row.company_id, teamId: row.team_id, onboarded: row.onboarded } };
    }
  }
  const demo = jar.get(DEMO_COOKIE)?.value;
  if (demo === "hr" || demo === "employee") return { kind: "demo", role: demo };
  return null;
});

export class AuthError extends Error {}

/** For server actions: the signed-in user with this role, or the demo flag. */
export async function requireRole(role: Role): Promise<{ demo: true } | { demo: false; user: SessionUser }> {
  const v = await getViewer();
  if (v?.kind === "demo" && v.role === role) return { demo: true };
  if (v?.kind === "user" && v.role === role) return { demo: false, user: v.user };
  throw new AuthError("Sesi berakhir. Silakan masuk lagi.");
}

/** One-time password reset link, valid for 3 days. */
export async function createResetToken(userId: string) {
  const sql = await db();
  const token = newId(24);
  await sql`delete from reset_tokens where user_id = ${userId}`;
  await sql`insert into reset_tokens (token_hash, user_id, expires_at) values (${sha256(token)}, ${userId}, now() + interval '3 days')`;
  return token;
}

export async function consumeResetToken(token: string, password: string) {
  const sql = await db();
  const [row] = await sql<{ user_id: string }[]>`delete from reset_tokens where token_hash = ${sha256(token)} and expires_at > now() returning user_id`;
  if (!row) return false;
  await sql`update users set password_hash = ${await hashPassword(password)} where id = ${row.user_id}`;
  await sql`delete from sessions where user_id = ${row.user_id}`;
  return true;
}

export async function resetTokenValid(token: string) {
  if (!hasDatabase()) return false;
  const sql = await db();
  const [row] = await sql`select 1 from reset_tokens where token_hash = ${sha256(token)} and expires_at > now()`;
  return Boolean(row);
}
