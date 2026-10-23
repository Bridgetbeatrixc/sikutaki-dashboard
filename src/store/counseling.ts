import { longDate, today } from "@/lib/week";
import { syncRequest } from "./cloud";
import { KEYS, newId, read, write } from "./local";

/*
 * Counseling requests: the employee asks HR to arrange a session (from the Konseling screen or the AI assistant),
 * they can talk it over in a short thread, and HR sends back a schedule. Kept in this browser and, when signed in,
 * saved to Supabase, where HR sees its company's requests without the account behind them. The session itself
 * stays between the employee and the psychologist.
 */

export type CounselStatus = "menunggu" | "dijadwalkan" | "selesai" | "dibatalkan";
export type CounselMessage = { from: "karyawan" | "hr"; text: string; at: string };
export type CounselRequest = {
  id: string;
  createdAt: string;
  /** Null when the employee asked without their name; HR then sees only the code. */
  name: string | null;
  code: string;
  teamId: string | null;
  /** Preferred partner, or null for "whoever is available". */
  partnerId: string | null;
  mode: "online" | "tatap muka";
  times: string[];
  days: string;
  via: "form" | "asisten";
  status: CounselStatus;
  schedule: { date: string; time: string; partnerId: string | null; place: string } | null;
  messages: CounselMessage[];
  /** HR has unread employee messages / the employee has unread HR messages. */
  unreadHr: boolean;
  unreadEmployee: boolean;
};

export const TIMES = ["Pagi", "Siang", "Sore", "Malam"] as const;
export const STATUS_LABEL: Record<CounselStatus, string> = { menunggu: "Menunggu HR", dijadwalkan: "Dijadwalkan", selesai: "Selesai", dibatalkan: "Dibatalkan" };

const now = () => new Date().toISOString();
export const loadRequests = (): CounselRequest[] => read<CounselRequest[]>(KEYS.counsel, []);
const save = (list: CounselRequest[]) => write(KEYS.counsel, list);
const change = (id: string, f: (r: CounselRequest) => CounselRequest) => {
  const list = loadRequests().map((r) => (r.id === id ? f(r) : r));
  save(list);
  const changed = list.find((r) => r.id === id);
  if (changed) syncRequest(changed);
  return list;
};

export type NewRequest = Pick<CounselRequest, "name" | "teamId" | "partnerId" | "mode" | "times" | "days" | "via"> & { note: string };

export function createRequest(input: NewRequest): CounselRequest {
  const { note, ...rest } = input;
  const r: CounselRequest = {
    ...rest, id: newId(), createdAt: now(), code: `K-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "menunggu", schedule: null, unreadHr: true, unreadEmployee: false,
    messages: note.trim() ? [{ from: "karyawan", text: note.trim(), at: now() }] : [],
  };
  save([r, ...loadRequests()]);
  syncRequest(r);
  return r;
}

export const sendMessage = (id: string, from: CounselMessage["from"], text: string) =>
  change(id, (r) => ({ ...r, messages: [...r.messages, { from, text: text.trim(), at: now() }], unreadHr: from === "karyawan" ? true : r.unreadHr, unreadEmployee: from === "hr" ? true : r.unreadEmployee }));

export const setSchedule = (id: string, schedule: NonNullable<CounselRequest["schedule"]>) =>
  change(id, (r) => ({
    ...r, schedule, status: "dijadwalkan", unreadEmployee: true,
    messages: [...r.messages, { from: "hr", text: `Jadwal dikirim: ${longDate(schedule.date)}, pukul ${schedule.time}, ${schedule.place}.`, at: now() }],
  }));

export const setStatus = (id: string, status: CounselStatus, by: CounselMessage["from"]) =>
  change(id, (r) => ({ ...r, status, unreadHr: by === "karyawan" || r.unreadHr, unreadEmployee: by === "hr" || r.unreadEmployee }));

export const markRead = (id: string, who: "hr" | "karyawan") =>
  change(id, (r) => (who === "hr" ? { ...r, unreadHr: false } : { ...r, unreadEmployee: false }));

export const isUpcoming = (r: CounselRequest) => r.status === "dijadwalkan" && !!r.schedule && r.schedule.date >= today();
