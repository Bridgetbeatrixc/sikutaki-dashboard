import { checkinAreas } from "@/lib/catalog";
import type { Enrollment } from "@/lib/practice";
import { sampleDataset } from "@/lib/sample";
import { addDays, rotationIndex, today, weekday, weekStart } from "@/lib/week";
import { scheduleEmployeeSync } from "./cloud";
import { loadHr } from "./hr";
import { KEYS, read, remove, write } from "./local";

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

/** The employee's data in this browser: a copy of their Supabase rows when signed in, the only copy in demo mode. */
export type EmployeeLocal = {
  profile: { name: string; email: string; teamId: string | null };
  onboarded: boolean;
  days: { day: string; mood: number; sleep: number }[];
  checkins: Record<string, { answers: Record<string, number>; causeArea: string | null; causes: string[] }>;
  done: Record<string, string[]>;
  programs: Enrollment[];
  energyOptIn: boolean;
  /** Programs carried through to the last day, for the personal report. */
  finished: { program: string; startedOn: string; finishedOn: string }[];
};

/** The check-in opens on the company's day (Monday to Friday) and closes Sunday 23.59 WIB. */
export function checkinWindow(day: string, opensOn: number) {
  const dow = (weekday(day) + 6) % 7 + 1; // 1 = Monday ... 7 = Sunday
  return { start: weekStart(day), open: dow >= opensOn };
}

const EMPTY: EmployeeLocal = {
  profile: { name: "Dimas", email: "", teamId: "cs" }, onboarded: false,
  days: [], checkins: {}, done: {}, programs: [], energyOptIn: false, finished: [],
};

export const loadEmployeeLocal = (): EmployeeLocal => ({ ...EMPTY, ...read<Partial<EmployeeLocal>>(KEYS.employee, {}) });
export const saveEmployeeLocal = (e: EmployeeLocal) => {
  write(KEYS.employee, e);
  scheduleEmployeeSync();
};
export const updateEmployeeLocal = (change: (e: EmployeeLocal) => EmployeeLocal) => saveEmployeeLocal(change(loadEmployeeLocal()));

/** Removes everything the employee app kept in this browser, journal entries included. */
export function clearEmployeeLocal() {
  remove(KEYS.employee);
  try {
    for (const k of Object.keys(window.localStorage)) if (k.startsWith(KEYS.journal)) window.localStorage.removeItem(k);
  } catch { /* storage blocked */ }
}

export function loadEmployee(): EmployeeData {
  const e = loadEmployeeLocal();
  const hr = loadHr();
  const day = today();
  const win = checkinWindow(day, hr.company.checkinDay);
  const mine = e.checkins[win.start];
  const teams = sampleDataset().teams.map((t) => ({ id: t.id, name: hr.teamNames[t.id] ?? t.name }));
  return {
    live: true,
    user: e.profile,
    company: { name: hr.company.name },
    teams,
    today: day,
    days: e.days.filter((d) => d.day > addDays(day, -7)).sort((a, b) => a.day.localeCompare(b.day)),
    week: {
      start: win.start,
      areas: checkinAreas(rotationIndex(win.start)),
      opensOn: hr.company.checkinDay,
      open: win.open,
      reminder: hr.company.reminder,
      answers: mine?.answers ?? null,
      causeArea: mine?.causeArea ?? null,
      causes: mine?.causes ?? [],
    },
    history: Object.entries(e.checkins)
      .filter(([w]) => w < win.start && w >= addDays(win.start, -7 * 11))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, c]) => ({ week, answers: c.answers })),
    done: e.done[day] ?? [],
    programs: e.programs,
    energy: { allowed: hr.company.energySection, optIn: e.energyOptIn },
    partners: hr.partners.filter((p) => !p.suspended).map(({ id, kind, practice, name, focus, schedule, contact }) => ({ id, kind, practice, name, focus, schedule, contact })),
  };
}

/** Writes the app's state back: daily notes, this week's check-in, today's practices, programs, the energy choice. */
export function saveEmployee(s: EmployeeData) {
  updateEmployeeLocal((e) => {
    const days = [...e.days.filter((d) => !s.days.some((x) => x.day === d.day)), ...s.days]
      .filter((d) => d.day > addDays(s.today, -400));
    const checkins = s.week.answers ? { ...e.checkins, [s.week.start]: { answers: s.week.answers, causeArea: s.week.causeArea, causes: s.week.causes } } : e.checkins;
    // Practices done per day are kept for 120 days, for the personal report.
    const done = Object.fromEntries(Object.entries({ ...e.done, [s.today]: s.done }).filter(([d, list]) => d > addDays(s.today, -120) && list.length));
    return { ...e, days, checkins, done, programs: s.programs, energyOptIn: s.energy.optIn };
  });
}

/** Notes a program that reached its last day (it then leaves the running list). */
export const logFinishedProgram = (program: string, startedOn: string, finishedOn: string) =>
  updateEmployeeLocal((e) => (e.finished?.some((f) => f.program === program && f.startedOn === startedOn) ? e : { ...e, finished: [...(e.finished ?? []), { program, startedOn, finishedOn }] }));
