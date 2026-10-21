import { ROUTES } from "@/lib/paths";
import { sampleDataset } from "@/lib/sample";
import { updateEmployeeLocal } from "./employee";
import { updateHr } from "./hr";

/*
 * The frontend-only version has no accounts: "signing up" stores a name in this browser and opens the app.
 * Same form-action shape as the backend version, so the pages stay the same.
 */

export type FormState = { error?: string; fields?: Record<string, string> } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const keep = (f: FormData) => Object.fromEntries([...f.entries()].filter(([, v]) => typeof v === "string").map(([k, v]) => [k, String(v)]));
const go = (path: string) => window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`);

/** HR names themself and the company; the dashboard keeps the sample divisions and numbers. */
export async function signupHr(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name"), company = str(f, "company");
  if (name.length < 2) return { error: "Isi nama lengkap.", fields: keep(f) };
  if (company.length < 2) return { error: "Isi nama perusahaan.", fields: keep(f) };
  updateHr((h) => ({ ...h, user: { name, email: str(f, "email") }, company: { ...h.company, name: company, industry: str(f, "industry") } }));
  go(ROUTES.hr.root);
  return undefined;
}

/** An employee picks a name and a division. */
export async function signupEmployee(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name"), team = str(f, "team");
  if (name.length < 2) return { error: "Isi nama panggilan.", fields: keep(f) };
  if (!sampleDataset().teams.some((t) => t.id === team)) return { error: "Pilih divisimu.", fields: keep(f) };
  updateEmployeeLocal((e) => ({ ...e, profile: { name, email: str(f, "email"), teamId: team }, onboarded: false }));
  go(ROUTES.employee.root);
  return undefined;
}

export function completeOnboarding() {
  updateEmployeeLocal((e) => ({ ...e, onboarded: true }));
}

/** No session to end: going back to the site is all "Keluar" does. Data stays in this browser. */
export async function logout() {
  go(ROUTES.home);
}
