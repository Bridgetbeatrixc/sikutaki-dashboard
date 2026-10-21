import { REPORT_REASONS, type Slot } from "@/lib/practice";
import { clearEmployeeLocal, updateEmployeeLocal } from "./employee";
import { recordReferral as countReferral, reportPartner as hidePartner } from "./hr-actions";
import { fail, newId, type Result } from "./local";

/*
 * Employee writes in the frontend-only version. The app's state is saved to this browser by EmployeeProvider,
 * so most of these only validate; they keep the backend version's names and shapes.
 */

export type { Result };
const ok: Result = { ok: true };

export async function saveDaily(mood: number, sleep: number): Promise<Result> {
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return fail("Pilih mood dulu.");
  if (!(sleep >= 0 && sleep <= 16)) return fail("Jam tidur tidak valid.");
  return ok;
}

export async function submitCheckin(_answers: Record<string, number>, _causes: string[]): Promise<Result> { return ok; }
export async function openCheckin(): Promise<void> {}
export async function markExercise(_id: string): Promise<Result> { return ok; }

export async function startProgram(_programId: string): Promise<Result & { id?: string }> { return { ok: true, id: newId() }; }
export async function setProgramPaused(_id: string, _paused: boolean): Promise<Result> { return ok; }
export async function stopProgram(_id: string): Promise<Result> { return ok; }
export async function completeSession(_id: string, _slot: Slot): Promise<Result> { return ok; }
export async function setEnergyOptIn(_on: boolean): Promise<Result> { return ok; }

export async function recordReferral(partnerId: string): Promise<Result> {
  countReferral(partnerId);
  return ok;
}

export async function reportPartner(partnerId: string, reason: string): Promise<Result> {
  if (!REPORT_REASONS.includes(reason)) return fail("Pilih alasan laporan.");
  hidePartner(partnerId);
  return ok;
}

export async function updateProfile(name: string, teamId: string): Promise<Result> {
  const n = name.trim();
  if (n.length < 2) return fail("Isi nama.");
  updateEmployeeLocal((e) => ({ ...e, profile: { ...e.profile, name: n.slice(0, 80), teamId } }));
  return ok;
}

/** Deletes everything the app kept in this browser. */
export async function deleteAccount(): Promise<Result> {
  clearEmployeeLocal();
  return ok;
}
