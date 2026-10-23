import { ROUTES } from "@/lib/paths";
import { sampleDataset } from "@/lib/sample";
import { supabase } from "@/lib/supabase/client";
import { supabaseReady } from "@/lib/supabase/config";
import { clearDemo, go, signOut } from "./cloud";
import { updateEmployeeLocal } from "./employee";

/*
 * Accounts with Supabase Auth (email and password). HR signs up and creates the company; employees join with
 * the company's invite code. The database trigger in supabase/schema.sql creates the company and profile.
 */

export type FormState = { error?: string; notice?: string; fields?: Record<string, string> } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const keep = (f: FormData) => Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === "string" && k !== "password").map(([k, v]) => [k, String(v)]));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OFFLINE = "Gagal tersambung ke server. Periksa koneksi internet, lalu coba lagi.";
const NOT_READY = "Server belum terhubung ke Supabase. Isi variabel lingkungan Supabase (lihat README), atau coba mode demo.";
const callback = (next: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

/** Supabase's English errors, in the app's language. */
function authError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("fetch") || m.includes("network")) return OFFLINE;
  if (m.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Buka tautan di email dari Sikutaki dulu.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("password")) return `Kata sandi belum memenuhi syarat: ${message}`;
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (m.includes("kode undangan")) return "Kode undangan tidak ditemukan. Minta kode terbaru ke HR.";
  return message;
}

function credentials(f: FormData): { email: string; password: string } | string {
  const email = str(f, "email"), password = String(f.get("password") ?? "");
  if (!EMAIL.test(email)) return "Isi email yang valid.";
  if (password.length < 8) return "Kata sandi minimal 8 karakter.";
  return { email, password };
}

/** Where to go after signing in: the page the visitor asked for, if it belongs to their role. */
function landing(role: string, next: string | null) {
  const root = role === "hr" ? ROUTES.hr.root : ROUTES.employee.root;
  return next && next.startsWith(root) ? next : root;
}

async function loginForm(_: FormState, f: FormData): Promise<FormState> {
  if (!supabaseReady) return { error: NOT_READY, fields: keep(f) };
  const c = credentials(f);
  if (typeof c === "string") return { error: c, fields: keep(f) };
  const sb = supabase();
  const { data, error } = await sb.auth.signInWithPassword(c);
  if (error || !data.user) return { error: authError(error?.message ?? "Gagal masuk."), fields: keep(f) };
  const { data: p } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!p) {
    await sb.auth.signOut();
    return { error: "Akun ini belum terhubung ke perusahaan. Daftar sebagai HR, atau gabung dengan kode undangan dari HR.", fields: keep(f) };
  }
  clearDemo();
  go(landing(p.role, str(f, "lanjut") || null));
  return undefined;
}

/** HR creates the account and the company. */
async function signupHrForm(_: FormState, f: FormData): Promise<FormState> {
  if (!supabaseReady) return { error: NOT_READY, fields: keep(f) };
  const name = str(f, "name"), company = str(f, "company");
  if (name.length < 2) return { error: "Isi nama lengkap.", fields: keep(f) };
  if (company.length < 2) return { error: "Isi nama perusahaan.", fields: keep(f) };
  const c = credentials(f);
  if (typeof c === "string") return { error: c, fields: keep(f) };
  const { data, error } = await supabase().auth.signUp({
    ...c,
    options: { data: { role: "hr", name, company, industry: str(f, "industry") }, emailRedirectTo: callback(ROUTES.hr.root) },
  });
  if (error) return { error: authError(error.message), fields: keep(f) };
  if (!data.session) return { notice: `Hampir selesai. Buka tautan konfirmasi yang kami kirim ke ${c.email}, lalu dashboard HR langsung terbuka.` };
  clearDemo();
  go(ROUTES.hr.root);
  return undefined;
}

export type InviteCompany = { name: string; teams: { id: string; name: string }[] };

/** The company behind an invite code, with its divisions; null when the code is unknown. */
export async function companyByInvite(code: string): Promise<InviteCompany | null> {
  if (!supabaseReady || !code.trim()) return null;
  const { data } = await supabase().rpc("company_by_invite", { code: code.trim() });
  if (!data) return null;
  const c = data as { name: string; teamNames: Record<string, string> };
  return { name: c.name, teams: sampleDataset().teams.map((t) => ({ id: t.id, name: c.teamNames[t.id] ?? t.name })) };
}

/** An employee creates an account in the company of the invite code. */
async function signupEmployeeForm(_: FormState, f: FormData): Promise<FormState> {
  if (!supabaseReady) return { error: NOT_READY, fields: keep(f) };
  const name = str(f, "name"), team = str(f, "team"), code = str(f, "code").toUpperCase();
  if (name.length < 2) return { error: "Isi nama panggilan.", fields: keep(f) };
  if (!sampleDataset().teams.some((t) => t.id === team)) return { error: "Pilih divisimu.", fields: keep(f) };
  const c = credentials(f);
  if (typeof c === "string") return { error: c, fields: keep(f) };
  const { data, error } = await supabase().auth.signUp({
    ...c,
    options: { data: { role: "employee", name, team, invite_code: code }, emailRedirectTo: callback(ROUTES.employee.root) },
  });
  if (error) return { error: authError(error.message), fields: keep(f) };
  if (!data.session) return { notice: `Hampir selesai. Buka tautan konfirmasi yang kami kirim ke ${c.email}, lalu aplikasimu langsung terbuka.` };
  clearDemo();
  go(ROUTES.employee.root);
  return undefined;
}

/** Sends a link to choose a new password. The answer is the same whether or not the email exists. */
async function requestResetForm(_: FormState, f: FormData): Promise<FormState> {
  if (!supabaseReady) return { error: NOT_READY, fields: keep(f) };
  const email = str(f, "email");
  if (!EMAIL.test(email)) return { error: "Isi email yang valid.", fields: keep(f) };
  const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo: callback(ROUTES.newPassword) });
  if (error) return { error: authError(error.message), fields: keep(f) };
  return { notice: `Bila ${email} terdaftar, tautan untuk mengganti kata sandi sudah dikirim. Periksa juga folder spam.` };
}

/** Sets the new password for the account signed in through the reset link. */
async function setNewPasswordForm(_: FormState, f: FormData): Promise<FormState> {
  if (!supabaseReady) return { error: NOT_READY };
  const password = String(f.get("password") ?? ""), again = String(f.get("again") ?? "");
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== again) return { error: "Kedua kata sandi tidak sama." };
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Tautan sudah kedaluwarsa. Minta tautan baru." };
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: authError(error.message) };
  await signOut();
  go(`${ROUTES.login}?sandi=baru`);
  return undefined;
}

/** A form action that never throws: a lost connection becomes a message under the form. */
const safe = (action: (s: FormState, f: FormData) => Promise<FormState>) => async (s: FormState, f: FormData): Promise<FormState> => {
  try {
    return await action(s, f);
  } catch {
    return { error: OFFLINE, fields: keep(f) };
  }
};
export const login = safe(loginForm);
export const signupHr = safe(signupHrForm);
export const signupEmployee = safe(signupEmployeeForm);
export const requestReset = safe(requestResetForm);
export const setNewPassword = safe(setNewPasswordForm);

export function completeOnboarding() {
  updateEmployeeLocal((e) => ({ ...e, onboarded: true }));
}

/** Ends the Supabase session (or the demo) and clears this browser's copy of the data. */
export async function logout() {
  await signOut();
  go(ROUTES.login);
}
