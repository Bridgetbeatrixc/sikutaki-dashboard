import type { Dataset, Note, Partner } from "@/lib/model";
import { sampleDataset } from "@/lib/sample";
import { monthKey, today } from "@/lib/week";
import { KEYS, read, write } from "./local";

/*
 * HR side. The dashboard numbers come from the sample company; the company's own settings, division names,
 * notes and partners are kept in this browser's copy, loaded from and saved to Supabase when signed in.
 */

export type HrLocal = {
  company: Omit<Dataset["company"], "employees">;
  user: { name: string; email: string };
  teamNames: Record<string, string>;
  notes: Note[];
  partners: Partner[];
  /** Contacts made from the employee app this month, added to the sample counts. */
  contacts: { month: string; psikolog: number; komplementer: number };
};

function seed(): HrLocal {
  const ds = sampleDataset();
  const { employees: _, ...company } = ds.company;
  return {
    company, user: ds.user, teamNames: {}, notes: ds.notes, partners: ds.partners,
    contacts: { month: monthKey(today()), psikolog: 0, komplementer: 0 },
  };
}

export const loadHr = (): HrLocal => ({ ...seed(), ...read<Partial<HrLocal>>(KEYS.hr, {}) });
export const saveHr = (h: HrLocal) => write(KEYS.hr, h);
export function updateHr(change: (h: HrLocal) => HrLocal) {
  const next = change(loadHr());
  saveHr(next);
  return next;
}

/** The dataset the dashboard reads: sample numbers with HR's own changes on top. */
export function localDataset(h = loadHr()): Dataset {
  const ds = sampleDataset();
  const contacts = h.contacts.month === monthKey(today()) ? h.contacts : { psikolog: 0, komplementer: 0 };
  const add = (list: number[], n: number) => list.map((v, i) => (i === list.length - 1 ? v + n : v));
  return {
    ...ds,
    live: true,
    company: { ...ds.company, ...h.company },
    user: h.user,
    teams: ds.teams.map((t) => ({ ...t, name: h.teamNames[t.id] ?? t.name })),
    notes: h.notes,
    partners: h.partners,
    referrals: { ...ds.referrals, byMonth: add(ds.referrals.byMonth, contacts.psikolog), complementary: add(ds.referrals.complementary, contacts.komplementer) },
  };
}
