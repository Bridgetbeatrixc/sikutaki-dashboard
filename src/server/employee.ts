import "server-only";
import { checkinAreas } from "@/lib/catalog";
import type { Enrollment, Slot } from "@/lib/practice";
import { addDays, rotationIndex, today, weekday, weekStart } from "@/lib/week";
import type { SessionUser } from "./auth";
import { db } from "./db";

/** Everything the employee app needs on load. Only the employee's own data. */
export type EmployeeData = {
  live: boolean;
  user: { name: string; email: string; teamId: string | null };
  company: { name: string };
  teams: { id: string; name: string }[];
  today: string;
  /** Daily notes of the last 7 days, oldest first. */
  days: { day: string; mood: number; sleep: number }[];
  week: {
    start: string;
    areas: string[];
    /** 1 = Monday ... 5 = Friday: the day this week's check-in opens. */
    opensOn: number;
    open: boolean;
    /** Show an in-app reminder while the check-in is open and not sent. */
    reminder: boolean;
    answers: Record<string, number> | null;
    causeArea: string | null;
    causes: string[];
  };
  /** Earlier check-ins (up to 12 weeks), oldest first, for the employee's own trend. */
  history: { week: string; answers: Record<string, number> }[];
  done: string[];
  /** Active programs (at most one of each kind) with every session done so far. */
  programs: Enrollment[];
  /** Latihan Energi shows only when the company allows it; the employee turns it on. */
  energy: { allowed: boolean; optIn: boolean };
  /** Psychologists and complementary practitioners; suspended practitioners are left out. */
  partners: { id: string; kind: "psikolog" | "komplementer"; practice: string; name: string; focus: string; schedule: string; contact: string }[];
};

/** The check-in opens on the company's day (Monday to Friday) and closes Sunday 23.59 WIB. */
export function checkinWindow(day: string, opensOn: number) {
  const dow = (weekday(day) + 6) % 7 + 1; // 1 = Monday ... 7 = Sunday
  return { start: weekStart(day), open: dow >= opensOn };
}

export async function loadEmployee(user: SessionUser): Promise<EmployeeData> {
  const sql = await db();
  const day = today();
  const [company] = await sql<{ name: string; checkin_day: number; reminder: boolean; energy_section: boolean }[]>`
    select name, checkin_day, reminder, energy_section from companies where id = ${user.companyId}`;
  const [me] = await sql<{ energy_opt_in: boolean }[]>`select energy_opt_in from users where id = ${user.id}`;
  const teams = await sql<{ id: string; name: string }[]>`select id, name from teams where company_id = ${user.companyId} order by created_at, name`;
  const win = checkinWindow(day, company.checkin_day);
  const days = await sql<{ day: string; mood: number; sleep: number }[]>`
    select to_char(day, 'YYYY-MM-DD') as day, mood, sleep from daily_logs
    where user_id = ${user.id} and day > ${addDays(day, -7)} order by day`;
  const checkins = await sql<{ week: string; answers: Record<string, number>; cause_area: string | null; causes: string[] }[]>`
    select to_char(week, 'YYYY-MM-DD') as week, answers, cause_area, causes from checkins
    where user_id = ${user.id} and week >= ${addDays(win.start, -7 * 11)} order by week`;
  const mine = checkins.find((c) => c.week === win.start);
  const done = await sql<{ exercise: string }[]>`select exercise from exercise_logs where user_id = ${user.id} and day = ${day}`;
  const partners = await sql<EmployeeData["partners"]>`
    select id, kind, practice, name, focus, schedule, contact from partners
    where company_id = ${user.companyId} and not suspended order by created_at`;
  const enrollments = await sql<{ id: string; program: string; started_on: string; paused: boolean }[]>`
    select id, program, to_char(started_on, 'YYYY-MM-DD') as started_on, paused from program_enrollments
    where user_id = ${user.id} and ended_on is null order by started_on`;
  const sessions = enrollments.length ? await sql<{ enrollment_id: string; day: string; slot: Slot }[]>`
    select enrollment_id, to_char(day, 'YYYY-MM-DD') as day, slot from program_sessions
    where enrollment_id in ${sql(enrollments.map((e) => e.id))}` : [];

  return {
    live: true,
    user: { name: user.name, email: user.email, teamId: user.teamId },
    company: { name: company.name },
    teams: teams.map((t) => ({ ...t })),
    today: day,
    days: days.map((d) => ({ ...d })),
    week: {
      start: win.start,
      areas: checkinAreas(rotationIndex(win.start)),
      opensOn: company.checkin_day,
      open: win.open,
      reminder: company.reminder,
      answers: mine?.answers ?? null,
      causeArea: mine?.cause_area ?? null,
      causes: mine?.causes ?? [],
    },
    history: checkins.filter((c) => c.week !== win.start).map((c) => ({ week: c.week, answers: c.answers })),
    done: done.map((d) => d.exercise),
    programs: enrollments.map((e) => ({
      id: e.id, program: e.program, startedOn: e.started_on, paused: e.paused,
      sessions: sessions.filter((x) => x.enrollment_id === e.id).map((x) => ({ day: x.day, slot: x.slot })),
    })),
    energy: { allowed: company.energy_section, optIn: me?.energy_opt_in ?? false },
    partners: partners.map((p) => ({ ...p })),
  };
}

/** The demo employee: an empty week, kept in the browser only. */
export function demoEmployee(): EmployeeData {
  const day = today();
  const start = weekStart(day);
  return {
    live: false,
    user: { name: "Dimas", email: "dimas@contoh.co.id", teamId: "cs" },
    company: { name: "PT Contoh Nusantara" },
    teams: [{ id: "cs", name: "Layanan Pelanggan" }],
    today: day,
    days: [],
    week: { start, areas: checkinAreas(rotationIndex(start)), opensOn: 1, open: true, reminder: true, answers: null, causeArea: null, causes: [] },
    history: [],
    done: [],
    programs: [],
    energy: { allowed: true, optIn: false },
    partners: [
      { id: "p1", kind: "psikolog", practice: "", name: "Dita Anggraini, M.Psi., Psikolog", focus: "Stres kerja, burnout", schedule: "Sen-Jum, 18.00-21.00", contact: "" },
      { id: "p2", kind: "psikolog", practice: "", name: "Raka Pratama, M.Psi., Psikolog", focus: "Kecemasan, serangan panik", schedule: "Sel & Kam, 19.00-21.00", contact: "" },
      { id: "p4", kind: "komplementer", practice: "chikung", name: "Contoh Instruktur Chikung", focus: "Gerak dan napas untuk relaksasi", schedule: "Sab, 07.00-09.00", contact: "" },
    ],
  };
}
