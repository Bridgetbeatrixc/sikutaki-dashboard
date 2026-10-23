import { ROUTES } from "@/lib/paths";
import { sampleDataset } from "@/lib/sample";
import { supabase } from "@/lib/supabase/client";
import { DEMO_COOKIE, supabaseReady } from "@/lib/supabase/config";
import { addDays, monthKey, today } from "@/lib/week";
import type { CounselRequest } from "./counseling";
import { loadEmployeeLocal, type EmployeeLocal } from "./employee";
import { loadHr, type HrLocal } from "./hr";
import { clearLocal, fail, KEYS, read, write, type Result } from "./local";

/*
 * Supabase sync. When an app opens, the signed-in account's data is loaded from Supabase into the browser copy
 * (local.ts), so the screens keep reading it synchronously. Every change is written back to Supabase.
 * In demo mode (no account) nothing here talks to the server.
 */

export type Role = "hr" | "employee";
export type Account = { userId: string; email: string; role: Role; companyId: string; name: string; teamId: string | null };

let account: Account | null = null;
/** The signed-in account, or null in demo mode. */
export const currentAccount = () => account;

const cookieDemo = () => typeof document !== "undefined" && document.cookie.split("; ").includes(`${DEMO_COOKIE}=1`);
export const clearDemo = () => { document.cookie = `${DEMO_COOKIE}=; Max-Age=0; path=/`; };

/** The browser copy belongs to one account (or the demo); another one starts from a clean copy. */
function claimLocal(owner: string) {
  if (read<string | null>(KEYS.owner, null) !== owner) clearLocal();
  write(KEYS.owner, owner);
}

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const go = (path: string) => window.location.assign(`${base}${path}`);

/**
 * Opens an app: demo mode, or the signed-in account with its data loaded from Supabase.
 * Returns an error to show, or navigates away when the visitor belongs somewhere else.
 */
export async function startApp(want: Role): Promise<{ ready: boolean; error?: string }> {
  if (cookieDemo() || !supabaseReady) {
    account = null;
    claimLocal("demo");
    return { ready: true };
  }
  const sb = supabase();
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError") return { ready: false, error: `Gagal memeriksa akun: ${authError.message}` };
  if (!user) {
    go(`${ROUTES.login}?lanjut=${encodeURIComponent(window.location.pathname.slice(base.length))}`);
    return { ready: false };
  }
  const { data: p, error } = await sb.from("profiles").select("company_id, role, name, email, team_id").eq("id", user.id).maybeSingle();
  if (error) return { ready: false, error: `Gagal memuat akun: ${error.message}` };
  if (!p) return { ready: false, error: "Akun ini belum terhubung ke perusahaan. Daftar sebagai HR, atau gabung dengan kode undangan dari HR." };
  if (p.role !== want) {
    go(p.role === "hr" ? ROUTES.hr.root : ROUTES.employee.root);
    return { ready: false };
  }
  account = { userId: user.id, email: user.email ?? p.email, role: p.role, companyId: p.company_id, name: p.name, teamId: p.team_id };
  claimLocal(user.id);
  try {
    if (want === "hr") await pullHr();
    else await pullEmployee();
  } catch (e) {
    return { ready: false, error: e instanceof Error ? e.message : "Gagal memuat data dari server." };
  }
  return { ready: true };
}

/** Signs out and forgets this browser's copy. */
export async function signOut() {
  if (supabaseReady) await supabase().auth.signOut().catch(() => undefined);
  account = null;
  clearDemo();
  clearLocal();
}

const check = <T,>(res: { data: T; error: { message: string } | null }) => {
  if (res.error) throw new Error(`Gagal memuat data dari server: ${res.error.message}`);
  return res.data;
};

/** Runs a write when signed in; a failed write comes back as a message for the toast. */
export async function cloudWrite(write: (a: Account) => PromiseLike<{ error: { message: string } | null }>): Promise<Result> {
  if (!account) return { ok: true };
  try {
    const { error } = await write(account);
    return error ? fail(`Gagal menyimpan ke server: ${error.message}`) : { ok: true };
  } catch {
    return fail("Gagal tersambung ke server. Periksa koneksi internet.");
  }
}

/* ---------- Company (shared by HR and employees) ---------- */

type CompanyRow = { name: string; industry: string; invite_code: string; settings: Record<string, unknown> | null };

function hrFromRow(row: CompanyRow, notes: HrLocal["notes"]): HrLocal {
  const d = sampleDataset().company;
  const s = (row.settings ?? {}) as Partial<HrLocal["company"]> & Partial<Pick<HrLocal, "teamNames" | "partners" | "contacts">>;
  return {
    company: {
      name: row.name, industry: row.industry, inviteCode: row.invite_code,
      minGroup: s.minGroup ?? d.minGroup, retentionMonths: s.retentionMonths ?? d.retentionMonths,
      checkinDay: s.checkinDay ?? d.checkinDay, reminder: s.reminder ?? d.reminder, energySection: s.energySection ?? d.energySection,
    },
    user: { name: account?.name ?? "", email: account?.email ?? "" },
    teamNames: s.teamNames ?? {},
    notes,
    partners: s.partners ?? [],
    contacts: s.contacts ?? { month: monthKey(today()), psikolog: 0, komplementer: 0 },
  };
}

async function pullCompany(withNotes: boolean) {
  const sb = supabase();
  const row = check(await sb.from("companies").select("name, industry, invite_code, settings").eq("id", account!.companyId).single()) as CompanyRow;
  const notes = withNotes ? ((check(await sb.from("company_hr").select("notes").eq("company_id", account!.companyId).maybeSingle()) as { notes: HrLocal["notes"] } | null)?.notes ?? []) : [];
  write(KEYS.hr, hrFromRow(row, notes));
}

/* ---------- HR ---------- */

async function pullHr() {
  await pullCompany(true);
  const requests = check(await supabase().rpc("hr_counseling_requests")) as CounselRequest[] | null;
  write(KEYS.counsel, requests ?? []);
}

/** Writes HR's changes (company settings, division names, partners, notes) back to Supabase. */
export function pushHr(): Promise<Result> {
  if (account?.role !== "hr") return Promise.resolve({ ok: true });
  const h = loadHr();
  const { name, industry, inviteCode: _code, ...settings } = h.company;
  return cloudWrite(async (a) => {
    const sb = supabase();
    const res = await sb.from("companies").update({ name, industry, settings: { ...settings, teamNames: h.teamNames, partners: h.partners, contacts: h.contacts } }).eq("id", a.companyId);
    if (res.error) return res;
    return sb.from("company_hr").upsert({ company_id: a.companyId, notes: h.notes });
  });
}

export type CompanySummary = { employees: number; checkins: number; loggers: number; minGroup: number; avgMood: number | null; avgSleep: number | null };

/** Real counts for the HR dashboard; averages only for groups big enough to stay anonymous. */
export async function companySummary(week: string): Promise<CompanySummary | null> {
  if (account?.role !== "hr") return null;
  const { data, error } = await supabase().rpc("company_summary", { week });
  return error ? null : (data as CompanySummary | null);
}

/* ---------- Employee ---------- */

/** What the employee_state row keeps; mood notes and check-ins have their own tables. */
type StateBlob = Pick<EmployeeLocal, "onboarded" | "done" | "programs" | "energyOptIn" | "finished"> & {
  /** "Lainnya" answers per check-in week; private to the employee (the checkins table only holds the choice). */
  causeNotes?: Record<string, string>;
};

async function pullEmployee() {
  const sb = supabase();
  const a = account!;
  const since = addDays(today(), -400);
  const [state, days, checkins, requests] = await Promise.all([
    sb.from("employee_state").select("data").eq("user_id", a.userId).maybeSingle(),
    sb.from("daily_logs").select("day, mood, sleep").eq("user_id", a.userId).gte("day", since),
    sb.from("checkins").select("week_start, answers, cause_area, causes").eq("user_id", a.userId).gte("week_start", since),
    sb.from("counseling_requests").select("payload").eq("user_id", a.userId).order("updated_at", { ascending: false }),
    pullCompany(false),
  ]);
  const { causeNotes = {}, ...blob } = (check(state) as { data: Partial<StateBlob> } | null)?.data ?? {};
  const local: EmployeeLocal = {
    ...loadEmployeeLocal(),
    ...blob,
    profile: { name: a.name, email: a.email, teamId: a.teamId },
    days: (check(days) as { day: string; mood: number; sleep: number | string }[]).map((d) => ({ day: d.day, mood: d.mood, sleep: Number(d.sleep) })),
    checkins: Object.fromEntries((check(checkins) as { week_start: string; answers: Record<string, number>; cause_area: string | null; causes: string[] }[])
      .map((c) => [c.week_start, { answers: c.answers, causeArea: c.cause_area, causes: c.causes ?? [], note: causeNotes[c.week_start] }])),
  };
  write(KEYS.employee, local);
  write(KEYS.counsel, (check(requests) as { payload: CounselRequest }[]).map((r) => r.payload));
}

let stateTimer: number | undefined;
/** Saves the employee's app state a moment after the last change (changes come in bursts). */
export function scheduleEmployeeSync() {
  if (account?.role !== "employee") return;
  window.clearTimeout(stateTimer);
  stateTimer = window.setTimeout(() => {
    const e = loadEmployeeLocal();
    const causeNotes = Object.fromEntries(Object.entries(e.checkins).flatMap(([w, c]) => (c.note ? [[w, c.note]] : [])));
    const data: StateBlob = { onboarded: e.onboarded, done: e.done, programs: e.programs, energyOptIn: e.energyOptIn, finished: e.finished, causeNotes };
    void cloudWrite((a) => supabase().from("employee_state").upsert({ user_id: a.userId, data, updated_at: new Date().toISOString() }))
      .then((r) => { if (!r.ok) console.error(r.error); });
  }, 600);
}

export function setAccountProfile(name: string, teamId: string | null) {
  if (account) account = { ...account, name, teamId };
}

/* ---------- Counseling requests ---------- */

/** Saves one request: the employee writes their own row, HR goes through a function that hides the account id. */
export function syncRequest(r: CounselRequest) {
  if (!account) return;
  const write = account.role === "hr"
    ? cloudWrite(() => supabase().rpc("hr_save_counseling", { req_id: r.id, req: r }))
    : cloudWrite((a) => supabase().from("counseling_requests").upsert({ id: r.id, company_id: a.companyId, user_id: a.userId, payload: r, updated_at: new Date().toISOString() }));
  void write.then((res) => { if (!res.ok) console.error(res.error); });
}
