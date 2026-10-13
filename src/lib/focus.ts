// Per-division focus: which areas need attention, what employees say causes them,
// and the notes HR keeps on what they did. Sample data for the prototype.
import { alerts, AREAS, areaStatus, areaValue, isHidden, NOW, respondents, Scope, severity, TEAMS, VAL, wellbeing, WEEKS } from "./data";

/* Follow-up question: asked to respondents who score medium or high on an area, multiple choice, anonymous. */
export type Cause = { id: string; label: string; idea: string };
export const CAUSES: Record<string, Cause> = {
  shift: { id: "shift", label: "Jadwal shift dan lembur", idea: "Tinjau jadwal shift dan jam lembur 4 minggu terakhir bersama lead divisi" },
  volume: { id: "volume", label: "Beban kerja atau target terlalu tinggi", idea: "Bahas ulang target dan pembagian beban kerja di rapat divisi" },
  after: { id: "after", label: "Pesan kerja di luar jam kerja", idea: "Sepakati jam tenang tanpa pesan kerja, misalnya 20.00 sampai 07.00" },
  pelanggan: { id: "pelanggan", label: "Tekanan dari pelanggan", idea: "Tambah jeda singkat setelah menangani pelanggan yang sulit" },
  recovery: { id: "recovery", label: "Kurang waktu istirahat", idea: "Pastikan jam istirahat tidak terpotong pekerjaan" },
  prioritas: { id: "prioritas", label: "Prioritas kerja tidak jelas", idea: "Minta lead divisi memperjelas 3 prioritas utama minggu ini" },
  atasan: { id: "atasan", label: "Hubungan dengan atasan atau rekan", idea: "Daftarkan lead divisi ke pelatihan manajer soal kesehatan mental" },
  pribadi: { id: "pribadi", label: "Masalah pribadi di luar kerja", idea: "Ingatkan divisi bahwa konseling psikolog di aplikasi rahasia dan tersedia untuk semua karyawan" },
  pikiran: { id: "pikiran", label: "Pikiran sulit berhenti", idea: "Ajak karyawan mencoba latihan tidur 14 hari di aplikasi" },
  layar: { id: "layar", label: "Main HP sebelum tidur", idea: "Ajak karyawan mencoba latihan tidur 14 hari di aplikasi" },
  pengakuan: { id: "pengakuan", label: "Merasa kurang dihargai", idea: "Biasakan apresiasi rutin dari lead divisi di rapat mingguan" },
};
const AREA_CAUSES: Record<string, string[]> = {
  burnout: ["shift", "pelanggan", "after", "volume", "recovery", "pribadi"],
  insomnia: ["shift", "after", "pikiran", "layar", "pribadi"],
  stres: ["volume", "prioritas", "pelanggan", "after", "pribadi"],
  anxiety: ["volume", "prioritas", "pelanggan", "atasan", "pribadi"],
  overthinking: ["prioritas", "after", "pikiran", "pribadi"],
  baterai: ["pelanggan", "recovery", "volume", "shift"],
};
const DEFAULT_CAUSES = ["atasan", "volume", "pengakuan", "pribadi"];

export function followUpQuestion(area: string) {
  if (area === "burnout" || area === "baterai") return "Apa yang paling menguras energimu minggu ini?";
  if (area === "insomnia") return "Apa yang paling sering membuatmu sulit tidur minggu ini?";
  if (["stres", "anxiety", "overthinking", "panik"].includes(area)) return "Apa sumber tekanan terbesarmu minggu ini?";
  return "Apa yang paling memengaruhi perasaan ini minggu ini?";
}

const PLANTED: Record<string, Record<string, number>> = {
  "cs-burnout": { shift: 58, pelanggan: 47, after: 31, volume: 26, recovery: 22, pribadi: 9 },
  "cs-insomnia": { shift: 44, after: 39, pikiran: 28, layar: 21, pribadi: 8 },
  "sales-anxiety": { volume: 61, prioritas: 38, pelanggan: 30, atasan: 14, pribadi: 10 },
  "sales-stres": { volume: 64, prioritas: 35, pelanggan: 33, after: 18, pribadi: 9 },
};
const r = (a: number, b: number) => { const x = Math.sin(a * 91.3 + b * 47.9) * 10000; return x - Math.floor(x); };

export function causeShares(team: string, area: string) {
  const v = VAL[team][area][NOW];
  const sev = severity(v);
  const n = Math.round((respondents(team) * (sev.sedang + sev.tinggi)) / 100);
  const ids = AREA_CAUSES[area] ?? DEFAULT_CAUSES;
  const planted = PLANTED[`${team}-${area}`];
  const rows = ids.map((id, i) => ({ cause: CAUSES[id], pct: planted?.[id] ?? Math.round(10 + r(i + area.length, team.length + i) * 40) }));
  return { question: followUpQuestion(area), n, rows: rows.sort((x, y) => y.pct - x.pct) };
}

export type Shares = { question: string; n: number; rows: { cause: Cause; pct: number }[] };

/* Focus areas for a division: rising or high areas first (this week's alerts), then "waspada" areas. Max 3. */
export type Focus = { area: string; v: number; d: number; reason: "naik" | "tinggi" | "waspada" };
export function focusAreas(team: string): Focus[] {
  if (isHidden(team)) return [];
  const out: Focus[] = alerts().filter((a) => a.team === team && a.area).map((a) => ({ area: a.area!, v: a.value, d: a.delta, reason: a.kind as "naik" | "tinggi" }));
  const extra = AREAS.map((a) => ({ area: a.id, v: VAL[team][a.id][NOW], d: VAL[team][a.id][NOW] - VAL[team][a.id][NOW - 2] }))
    .filter((x) => areaStatus(x.v) !== "baik" && !out.some((o) => o.area === x.area)).sort((x, y) => y.v - x.v)
    .map((x) => ({ ...x, reason: "waspada" as const }));
  return [...out, ...extra].slice(0, 3);
}

/* HR notes: what HR decided or did for a division. Each note remembers the focus score when it was written. */
export type NoteType = "dilakukan" | "rencana" | "pantau";
export const NOTE_LABEL: Record<NoteType, string> = { dilakukan: "Sudah dilakukan", rencana: "Rencana", pantau: "Dipantau" };
export type Note = { id: string; team: string; week: number; type: NoteType; area?: string; text: string; by: string };
export const INITIAL_NOTES: Note[] = [
  { id: "n1", team: "tech", week: 4, type: "dilakukan", area: "stres", text: "Uji coba jam kerja fleksibel 8 minggu, jam inti 10.00 sampai 15.00. Disepakati bersama lead divisi.", by: "Rina A." },
  { id: "n2", team: "sales", week: 9, type: "dilakukan", area: "anxiety", text: "Kelas kelola stres 4 minggu di aplikasi Sikutaki dibuka untuk divisi ini. Sesi kelompok dengan psikolog setiap Rabu.", by: "Rina A." },
  { id: "n3", team: "ops", week: 1, type: "dilakukan", area: "burnout", text: "Workshop pemulihan burnout 90 menit bersama psikolog.", by: "Rina A." },
  { id: "n4", team: "cs", week: 10, type: "pantau", area: "burnout", text: "Volume komplain naik sejak promo September. Pantau dua minggu lagi sebelum mengubah jadwal shift.", by: "Rina A." },
];
export const noteChange = (n: Note) => (n.area ? { before: VAL[n.team][n.area][Math.max(0, n.week - 1)], now: VAL[n.team][n.area][NOW] } : null);

/* Extra metrics that come from the employee app (sample, derived from the weekly scores). */
const scopeTeams = (s: Scope) => (s === "all" ? TEAMS : TEAMS.filter((t) => t.id === s));
const weighted = (s: Scope, f: (team: string) => number, w = NOW) => {
  let sum = 0, n = 0;
  for (const t of scopeTeams(s)) { const r = respondents(t.id, w); sum += f(t.id) * r; n += r; }
  return n ? sum / n : 0;
};
// Average sleep hours reported in the daily check-in
export const sleepHours = (s: Scope, w = NOW) => Math.round(weighted(s, (t) => 7.7 - (VAL[t].insomnia[w] - 30) * 0.045, w) * 10) / 10;
export const sleepSeries = (s: Scope) => WEEKS.map((_, w) => sleepHours(s, w));
// Average daily mood on a 1 to 5 scale
export const moodAvg = (s: Scope, w = NOW) => Math.round((1 + wellbeing(s, w) / 25) * 10) / 10;
// Share of daily mood answers this week, from "Berat" to "Sangat baik"
export const MOODS = ["Berat", "Kurang", "Biasa", "Baik", "Sangat baik"];
export function moodDist(s: Scope) {
  const m = moodAvg(s);
  const raw = [1, 2, 3, 4, 5].map((k) => Math.exp(-((k - m) ** 2) / 1.6));
  const tot = raw.reduce((a, b) => a + b, 0);
  const pct = raw.map((x) => Math.round((x / tot) * 100));
  pct[2] += 100 - pct.reduce((a, b) => a + b, 0);
  return pct;
}
export const dailyActive = (s: Scope) => Math.round(weighted(s, (t) => (t === "tech" || t === "fin" ? 0.61 : 0.48)) * 100);
export const topCompanyAreas = (n = 5) => AREAS.map((a) => ({ area: a, v: areaValue("all", a.id), d: areaValue("all", a.id) - areaValue("all", a.id, NOW - 4) })).sort((x, y) => y.v - x.v).slice(0, n);
