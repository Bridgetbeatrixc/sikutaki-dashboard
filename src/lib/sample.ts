// Sample data for the demo company: 8 divisions, 12 weeks, 42 areas. Deterministic, so the demo
// looks the same on every load. Produces the same Dataset shape the server builds from real check-ins.

import { AREAS, causesFor, CORE, MIN_GROUP } from "./catalog";
import type { Dataset, Note, WeekAgg } from "./model";
import { MONTHS } from "./week";

type Team = { id: string; name: string; size: number; lead: string };
const TEAMS: Team[] = [
  { id: "ops", name: "Operasional", size: 120, lead: "Budi S." },
  { id: "cs", name: "Layanan Pelanggan", size: 98, lead: "Maya R." },
  { id: "sales", name: "Penjualan", size: 86, lead: "Andre W." },
  { id: "tech", name: "Teknologi", size: 72, lead: "Sinta P." },
  { id: "mkt", name: "Pemasaran", size: 58, lead: "Dewi L." },
  { id: "fin", name: "Keuangan", size: 34, lead: "Hendra K." },
  { id: "hr", name: "SDM", size: 18, lead: "Rina A." },
  { id: "legal", name: "Legal", size: 4, lead: "Tono H." },
];
const teamById = (id: string) => TEAMS.find((t) => t.id === id)!;

// 12 weekly check-ins, Mondays from 20 Jul to 5 Oct 2026.
const WEEKS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 6, 20 + i * 7));
  return { label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`, start: d.toISOString().slice(0, 10) };
});
const NOW = WEEKS.length - 1;

// Seeded noise
const rand = (a: number, b: number, c: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp = (v: number, lo = 4, hi = 96) => Math.max(lo, Math.min(hi, v));

const teamBase: Record<string, number> = { ops: 40, cs: 46, sales: 47, tech: 44, mkt: 38, fin: 34, hr: 33, legal: 36 };
const areaBase: Record<string, number> = {
  sedih: -4, galau: 2, kecewa: -2, hampa: -6, depresi: -10, stres: 10, anxiety: 4, overthinking: 8, panik: -16, burnout: 8, insomnia: 2, baterai: 6, minder: 0, trauma: -14, dendam: -12, marah: -2, narsistik: -10, moodswing: 1, matirasa: -1, duka: -3, apatis: 1, disosiasi: -7, eksistensial: -1, selfesteem: 3, impostor: 5, sosial: 3, relasi: 1, pleaser: 5, cemburu: -1, perfeksionis: 5, fomo: 5, gadget: 7, prokrastinasi: 6, makan: 1, egois: -1, sombong: -3, keras: 1, ambisius: 5, bipolar: -9, adhd: -3, skizofrenia: -15, psikopat: -15,
};

// Planted stories (week index -> extra points)
function story(team: string, area: string, w: number): number {
  let v = 0;
  if (team === "cs" && area === "burnout") v += w >= 8 ? (w - 7) * 5 : 0; // rising last 4 weeks
  if (team === "cs" && area === "insomnia") v += w >= 9 ? (w - 8) * 4 : 0;
  if (team === "cs" && area === "baterai") v += 8;
  if (team === "sales" && (area === "anxiety" || area === "stres")) v += 6 + (w >= 7 ? (w - 6) * 2.2 : 0);
  if (team === "sales" && area === "marah") v += 7;
  if (team === "tech" && (area === "stres" || area === "overthinking")) v += w < 4 ? 16 : Math.max(0, 16 - (w - 3) * 2.6); // program from week 5
  if (team === "tech" && area === "insomnia") v += w < 4 ? 8 : Math.max(0, 8 - (w - 3) * 1.4);
  if (team === "fin" && area === "minder") v += 4;
  return v;
}

const VAL: Record<string, Record<string, number[]>> = {};
for (const t of TEAMS) {
  VAL[t.id] = {};
  AREAS.forEach((a, ai) => {
    VAL[t.id][a.id] = WEEKS.map((_, w) => {
      const noise = (rand(ai, w, t.size) - 0.5) * 4;
      return Math.round(clamp(teamBase[t.id] + areaBase[a.id] + story(t.id, a.id, w) + noise));
    });
  });
}

const partBase: Record<string, number> = { ops: 82, cs: 79, sales: 74, tech: 88, mkt: 71, fin: 90, hr: 94, legal: 75 };
const PART: Record<string, number[]> = {};
for (const t of TEAMS) {
  PART[t.id] = WEEKS.map((_, w) => {
    let p = partBase[t.id] + (rand(w, 3, t.size) - 0.5) * 8 + (w < 2 ? -8 : 0);
    if (t.id === "mkt" && w >= 9) p = 58 - (w - 9) * 6; // dropping
    return Math.round(Math.max(30, Math.min(99, p)));
  });
}

const respondents = (teamId: string, w: number) => Math.round((teamById(teamId).size * PART[teamId][w]) / 100);

/** Weighted by respondents, hidden teams included: they sit inside a large enough group here. */
function companyValue(area: string, w: number) {
  let sum = 0, n = 0;
  for (const t of TEAMS) { const r = respondents(t.id, w); sum += VAL[t.id][area][w] * r; n += r; }
  return n ? Math.round(sum / n) : 0;
}

// Share of respondents at each level, derived from the mean (sample approximation).
function severity(v: number): [number, number, number] {
  const tinggi = Math.round(Math.max(3, Math.min(70, (v - 30) * 1.25)));
  const rendah = Math.round(Math.max(5, Math.min(85, (72 - v) * 1.45)));
  return [rendah, Math.max(0, 100 - tinggi - rendah), tinggi];
}

const PLANTED: Record<string, Record<string, number>> = {
  "cs-burnout": { shift: 58, pelanggan: 47, after: 31, volume: 26, recovery: 22, pribadi: 9 },
  "cs-insomnia": { shift: 44, after: 39, pikiran: 28, layar: 21, pribadi: 8 },
  "sales-anxiety": { volume: 61, prioritas: 38, pelanggan: 30, atasan: 14, pribadi: 10 },
  "sales-stres": { volume: 64, prioritas: 35, pelanggan: 33, after: 18, pribadi: 9 },
};
const r = (a: number, b: number) => { const x = Math.sin(a * 91.3 + b * 47.9) * 10000; return x - Math.floor(x); };

function causes(team: string, area: string, v: number) {
  const sev = severity(v);
  const n = Math.round((respondents(team, NOW) * (sev[1] + sev[2])) / 100);
  const planted = PLANTED[`${team}-${area}`];
  const pct: Record<string, number> = {};
  causesFor(area).forEach((id, i) => { pct[id] = planted?.[id] ?? Math.round(10 + r(i + area.length, team.length + i) * 40); });
  return { n, pct };
}

function wellbeingOf(scores: Record<string, number>) {
  let sum = 0, wt = 0;
  for (const a of AREAS) { const k = CORE.includes(a.id) ? 3 : 1; sum += scores[a.id] * k; wt += k; }
  return Math.max(0, Math.min(100, 114 - (sum / wt) * 1.15));
}

function daily(scores: Record<string, number>, users: number) {
  const mood = 1 + Math.round(wellbeingOf(scores)) / 25;
  const raw = [1, 2, 3, 4, 5].map((k) => Math.exp(-((k - mood) ** 2) / 1.6));
  const tot = raw.reduce((a, b) => a + b, 0);
  const moodDist = raw.map((x) => Math.round((x / tot) * 100));
  moodDist[2] += 100 - moodDist.reduce((a, b) => a + b, 0);
  return { users, mood, moodDist, sleep: 7.7 - (scores.insomnia - 30) * 0.045 };
}

function teamWeek(t: Team, w: number): WeekAgg {
  const resp = respondents(t.id, w);
  const hidden = resp < MIN_GROUP;
  if (hidden) return { resp, size: t.size, hidden, areas: {}, sev: {}, causes: {}, daily: null };
  const areas: Record<string, number> = {}, sev: WeekAgg["sev"] = {}, cs: WeekAgg["causes"] = {};
  for (const a of AREAS) {
    const v = VAL[t.id][a.id][w];
    areas[a.id] = v; sev[a.id] = severity(v);
    if (w === NOW) cs[a.id] = causes(t.id, a.id, v);
  }
  const share = t.id === "tech" || t.id === "fin" ? 0.61 : 0.48;
  return { resp, size: t.size, hidden, areas, sev, causes: cs, daily: daily(areas, Math.round(t.size * share)) };
}

function companyWeek(w: number): WeekAgg {
  const areas: Record<string, number> = {}, sev: WeekAgg["sev"] = {};
  for (const a of AREAS) { areas[a.id] = companyValue(a.id, w); sev[a.id] = severity(areas[a.id]); }
  const resp = TEAMS.reduce((s, t) => s + respondents(t.id, w), 0);
  const size = TEAMS.reduce((s, t) => s + t.size, 0);
  const users = TEAMS.reduce((s, t) => s + Math.round(t.size * (t.id === "tech" || t.id === "fin" ? 0.61 : 0.48)), 0);
  return { resp, size, hidden: false, areas, sev, causes: {}, daily: daily(areas, users) };
}

const NOTES: Note[] = [
  { id: "n1", team: "tech", week: 4, date: WEEKS[4].label, type: "dilakukan", area: "stres", text: "Uji coba jam kerja fleksibel 8 minggu, jam inti 10.00 sampai 15.00. Disepakati bersama lead divisi.", by: "Rina A." },
  { id: "n2", team: "sales", week: 9, date: WEEKS[9].label, type: "dilakukan", area: "anxiety", text: "Kelas kelola stres 4 minggu di aplikasi Sikutaki dibuka untuk divisi ini. Sesi kelompok dengan psikolog setiap Rabu.", by: "Rina A." },
  { id: "n3", team: "ops", week: 1, date: WEEKS[1].label, type: "dilakukan", area: "burnout", text: "Workshop pemulihan burnout 90 menit bersama psikolog.", by: "Rina A." },
  { id: "n4", team: "cs", week: 10, date: WEEKS[10].label, type: "pantau", area: "burnout", text: "Volume komplain naik sejak promo September. Pantau dua minggu lagi sebelum mengubah jadwal shift.", by: "Rina A." },
];

/** The demo company. */
export function sampleDataset(): Dataset {
  const scopes: Dataset["scopes"] = { all: WEEKS.map((_, w) => companyWeek(w)) };
  for (const t of TEAMS) scopes[t.id] = WEEKS.map((_, w) => teamWeek(t, w));
  const employees = TEAMS.reduce((s, t) => s + t.size, 0);
  const completed = scopes.all[NOW].resp;
  return {
    live: false,
    company: { name: "PT Contoh Nusantara", employees, industry: "Jasa", inviteCode: "DEMO", minGroup: MIN_GROUP, retentionMonths: 24, checkinDay: 3, reminder: true, energySection: true },
    user: { name: "Rina A.", email: "rina@contoh.co.id" },
    teams: TEAMS,
    weeks: WEEKS,
    rotation0: 0,
    scopes,
    referrals: { months: ["Jul", "Agu", "Sep", "Okt"], byMonth: [3, 4, 5, 7], complementary: [0, 1, 2, 2] },
    notes: NOTES,
    partners: [
      { id: "p1", name: "Dita Anggraini, M.Psi., Psikolog", focus: "Stres kerja, burnout", schedule: "Sen-Jum, 18.00-21.00", contact: "", kind: "psikolog", practice: "", credential: "", verifiedBy: "", suspended: false, reports: 0 },
      { id: "p2", name: "Raka Pratama, M.Psi., Psikolog", focus: "Kecemasan, serangan panik", schedule: "Sel & Kam, 19.00-21.00", contact: "", kind: "psikolog", practice: "", credential: "", verifiedBy: "", suspended: false, reports: 0 },
      { id: "p4", name: "Contoh Instruktur Chikung", focus: "Gerak dan napas untuk relaksasi", schedule: "Sab, 07.00-09.00", contact: "", kind: "komplementer", practice: "chikung", credential: "Sertifikat instruktur (contoh)", verifiedBy: "Rina A.", suspended: false, reports: 0 },
      { id: "p3", name: "Layanan Konseling Mitra (24 jam)", focus: "Krisis dan rujukan lanjutan", schedule: "Setiap hari", contact: "", kind: "psikolog", practice: "", credential: "", verifiedBy: "", suspended: false, reports: 0 },
    ],
    funnel: { registered: employees, opened: Math.round(completed * 1.1), completed },
  };
}
