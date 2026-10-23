import { AREAS, MIN_GROUP, NOTE_TYPES, type NoteType } from "@/lib/catalog";
import { practitionerType } from "@/lib/practice";
import { monthKey, shortDate, today } from "@/lib/week";
import { supabase } from "@/lib/supabase/client";
import { currentAccount, pushHr } from "./cloud";
import { updateHr, loadHr } from "./hr";
import { fail, newId, type Result } from "./local";

/* Everything HR changes: applied to this browser's copy, then written to Supabase when signed in (pushHr). */

export type { Result };
const NO_BACKEND = "Belum tersedia: divisi mengikuti 8 divisi contoh selama angka dashboard memakai data contoh. Nama divisi bisa diganti.";
/** The sample data has 12 weeks; notes written now belong to the last one. */
const CURRENT_WEEK = 11;

export async function addNote(team: string, type: NoteType, area: string, text: string): Promise<Result> {
  const t = text.trim();
  if (!t) return fail("Tulis isi catatan.");
  if (!NOTE_TYPES.includes(type)) return fail("Jenis catatan tidak dikenal.");
  if (area && !AREAS.some((a) => a.id === area)) return fail("Area tidak dikenal.");
  updateHr((h) => ({ ...h, notes: [...h.notes, { id: newId(), team, week: CURRENT_WEEK, date: shortDate(today()), type, area: area || undefined, text: t.slice(0, 2000), by: h.user.name }] }));
  return pushHr();
}

export async function deleteNote(id: string): Promise<Result> {
  updateHr((h) => ({ ...h, notes: h.notes.filter((n) => n.id !== id) }));
  return pushHr();
}

export async function updateCompany(name: string, industry: string): Promise<Result> {
  if (name.trim().length < 2) return fail("Isi nama perusahaan.");
  updateHr((h) => ({ ...h, company: { ...h.company, name: name.trim().slice(0, 120), industry: industry.trim().slice(0, 60) } }));
  return pushHr();
}

export async function addTeam(_name: string): Promise<Result> { return fail(NO_BACKEND); }
export async function deleteTeam(_id: string): Promise<Result> { return fail(NO_BACKEND); }

export async function renameTeam(id: string, name: string): Promise<Result> {
  if (!name.trim()) return fail("Tulis nama divisi.");
  updateHr((h) => ({ ...h, teamNames: { ...h.teamNames, [id]: name.trim().slice(0, 60) } }));
  return pushHr();
}

export async function saveSchedule(day: number, reminder: boolean): Promise<Result> {
  if (!Number.isInteger(day) || day < 1 || day > 5) return fail("Pilih hari Senin sampai Jumat.");
  updateHr((h) => ({ ...h, company: { ...h.company, checkinDay: day, reminder } }));
  return pushHr();
}

export async function savePrivacy(minGroup: number, retentionMonths: number): Promise<Result> {
  if (!Number.isInteger(minGroup) || minGroup < MIN_GROUP || minGroup > 15) return fail("Ukuran kelompok minimal 5 sampai 15 orang.");
  if (![12, 24, 36].includes(retentionMonths)) return fail("Pilih 12, 24, atau 36 bulan.");
  updateHr((h) => ({ ...h, company: { ...h.company, minGroup, retentionMonths } }));
  return pushHr();
}

/** A contact must be a web link (booking page, WhatsApp link) or an email address. */
function normalizeContact(raw: string): string | null {
  const c = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return `mailto:${c}`;
  if (/^\+?\d[\d\s-]{7,}$/.test(c)) return `https://wa.me/${c.replace(/\D/g, "").replace(/^0/, "62")}`;
  try {
    const u = new URL(c);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch { return null; }
}

export type PartnerInput = {
  name: string; focus: string; schedule: string; contact: string;
  kind: "psikolog" | "komplementer";
  practice: string; credential: string;
  /** HR confirms it checked the credential and that the practitioner agreed to the code of ethics. */
  confirmed: boolean;
};

export async function addPartner(p: PartnerInput): Promise<Result> {
  if (p.name.trim().length < 2) return fail("Isi nama psikolog, praktisi, atau layanan.");
  const contact = normalizeContact(p.contact);
  if (!contact) return fail("Kontak harus berupa tautan (https://...), nomor WhatsApp, atau alamat email.");
  const kind = p.kind === "komplementer" ? "komplementer" : "psikolog";
  if (kind === "komplementer") {
    if (!practitionerType(p.practice)) return fail("Pilih jenis praktik.");
    if (p.credential.trim().length < 3) return fail("Isi kredensial praktisi, misalnya nomor sertifikat atau surat terdaftar.");
    if (!p.confirmed) return fail("Centang konfirmasi bahwa kredensial sudah diperiksa dan praktisi menyetujui kode etik.");
  }
  const comp = kind === "komplementer";
  updateHr((h) => ({
    ...h,
    partners: [...h.partners, {
      id: newId(), name: p.name.trim().slice(0, 120), focus: p.focus.trim().slice(0, 120), schedule: p.schedule.trim().slice(0, 120), contact, kind,
      practice: comp ? p.practice : "", credential: comp ? p.credential.trim().slice(0, 200) : "", verifiedBy: comp ? h.user.name : "", suspended: false, reports: 0,
    }],
  }));
  return pushHr();
}

export async function removePartner(id: string): Promise<Result> {
  updateHr((h) => ({ ...h, partners: h.partners.filter((p) => p.id !== id) }));
  return pushHr();
}

/** After HR has reviewed the reports, the practitioner is shown to employees again. */
export async function reactivatePartner(id: string): Promise<Result> {
  updateHr((h) => ({ ...h, partners: h.partners.map((p) => (p.id === id ? { ...p, suspended: false, reports: 0 } : p)) }));
  return pushHr();
}

export async function saveEnergySection(on: boolean): Promise<Result> {
  updateHr((h) => ({ ...h, company: { ...h.company, energySection: on } }));
  return pushHr();
}

/** Supabase emails the employee a link to choose a new password. */
export async function createResetLink(email: string): Promise<Result> {
  if (!currentAccount()) return fail("Mode demo tidak memakai akun dan kata sandi.");
  const e = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return fail("Isi email karyawan.");
  const { error } = await supabase().auth.resetPasswordForEmail(e, { redirectTo: `${window.location.origin}/auth/callback?next=/atur-sandi` });
  return error ? fail(`Gagal mengirim email: ${error.message}`) : { ok: true };
}

export async function regenerateInvite(): Promise<Result> {
  let code: string;
  if (currentAccount()) {
    const { data, error } = await supabase().rpc("regenerate_invite");
    if (error || typeof data !== "string") return fail(`Gagal membuat kode baru: ${error?.message ?? "tidak ada jawaban"}`);
    code = data;
  } else {
    const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    code = Array.from({ length: 8 }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
  }
  updateHr((h) => ({ ...h, company: { ...h.company, inviteCode: code } }));
  return { ok: true, value: code };
}

/* Called from the employee app: changes this browser's copy (the demo's only copy; Supabase goes through RPCs). */

/** HR sees a count per month and kind, never who. */
export function recordReferral(partnerId: string) {
  const p = loadHr().partners.find((x) => x.id === partnerId);
  if (!p) return;
  updateHr((h) => {
    const month = monthKey(today());
    const c = h.contacts.month === month ? h.contacts : { month, psikolog: 0, komplementer: 0 };
    return { ...h, contacts: { ...c, [p.kind]: c[p.kind] + 1 } };
  });
}

/** A report hides a complementary practitioner until HR has reviewed it. The reporter is not stored. */
export function reportPartner(partnerId: string) {
  updateHr((h) => ({ ...h, partners: h.partners.map((p) => (p.id === partnerId ? { ...p, suspended: true, reports: p.reports + 1 } : p)) }));
}
