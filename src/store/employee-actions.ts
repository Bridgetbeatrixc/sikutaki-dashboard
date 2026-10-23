import { checkinAreas, followUpArea } from "@/lib/catalog";
import { REPORT_REASONS, type Slot } from "@/lib/practice";
import { sampleDataset } from "@/lib/sample";
import { supabase } from "@/lib/supabase/client";
import { monthKey, rotationIndex, today, weekStart } from "@/lib/week";
import { cloudWrite, currentAccount, setAccountProfile, signOut } from "./cloud";
import { clearEmployeeLocal, updateEmployeeLocal } from "./employee";
import { loadHr } from "./hr";
import { recordReferral as countReferral, reportPartner as hidePartner } from "./hr-actions";
import { fail, newId, type Result } from "./local";

/*
 * Employee writes. EmployeeProvider keeps the app's state in this browser; mood notes and check-ins are also
 * written to their Supabase tables here, and the rest of the state is saved by cloud.scheduleEmployeeSync.
 * In demo mode the cloud writes do nothing.
 */

export type { Result };
const ok: Result = { ok: true };

export async function saveDaily(mood: number, sleep: number): Promise<Result> {
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return fail("Pilih mood dulu.");
  if (!(sleep >= 0 && sleep <= 16)) return fail("Jam tidur tidak valid.");
  return cloudWrite((a) => supabase().from("daily_logs").upsert({
    user_id: a.userId, company_id: a.companyId, team_id: a.teamId, day: today(), mood, sleep, updated_at: new Date().toISOString(),
  }));
}

export async function submitCheckin(answers: Record<string, number>, causes: string[]): Promise<Result> {
  if (Object.values(answers).some((v) => !Number.isInteger(v) || v < 0 || v > 4)) return fail("Jawaban check-in tidak valid.");
  const start = weekStart(today());
  return cloudWrite((a) => supabase().from("checkins").upsert({
    user_id: a.userId, company_id: a.companyId, team_id: a.teamId, week_start: start, answers,
    cause_area: followUpArea(checkinAreas(rotationIndex(start)), answers), causes, submitted_at: new Date().toISOString(),
  }));
}

export async function openCheckin(): Promise<void> {}
export async function markExercise(_id: string): Promise<Result> { return ok; }

export async function startProgram(_programId: string): Promise<Result & { id?: string }> { return { ok: true, id: newId() }; }
export async function setProgramPaused(_id: string, _paused: boolean): Promise<Result> { return ok; }
export async function stopProgram(_id: string): Promise<Result> { return ok; }
export async function completeSession(_id: string, _slot: Slot): Promise<Result> { return ok; }
export async function setEnergyOptIn(_on: boolean): Promise<Result> { return ok; }

/** HR sees one more contact this month, never who. */
export async function recordReferral(partnerId: string): Promise<Result> {
  if (!currentAccount()) {
    countReferral(partnerId);
    return ok;
  }
  const p = loadHr().partners.find((x) => x.id === partnerId);
  if (!p) return ok;
  return cloudWrite(() => supabase().rpc("record_referral", { kind: p.kind, month: monthKey(today()) }));
}

export async function reportPartner(partnerId: string, reason: string): Promise<Result> {
  if (!REPORT_REASONS.includes(reason)) return fail("Pilih alasan laporan.");
  hidePartner(partnerId);
  return cloudWrite(() => supabase().rpc("report_partner", { partner_id: partnerId }));
}

export async function updateProfile(name: string, teamId: string): Promise<Result> {
  const n = name.trim().slice(0, 80);
  if (n.length < 2) return fail("Isi nama.");
  if (!sampleDataset().teams.some((t) => t.id === teamId)) return fail("Pilih divisimu.");
  const res = await cloudWrite((a) => supabase().from("profiles").update({ name: n, team_id: teamId }).eq("id", a.userId));
  if (!res.ok) return res;
  setAccountProfile(n, teamId);
  updateEmployeeLocal((e) => ({ ...e, profile: { ...e.profile, name: n, teamId } }));
  return ok;
}

/** Deletes the account and everything stored for it (Supabase rows and this browser's copy). */
export async function deleteAccount(): Promise<Result> {
  const res = await cloudWrite(() => supabase().rpc("delete_my_account"));
  if (!res.ok) return res;
  if (currentAccount()) await signOut();
  clearEmployeeLocal();
  return ok;
}
