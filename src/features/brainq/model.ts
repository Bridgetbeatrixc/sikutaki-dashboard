/*
 * BrainQ Workforce: types for the aggregated data that Supabase returns (function bq_dashboard in
 * supabase/brainq.sql), labels in Indonesian, and the rules that decide which team needs attention.
 */

export type Domains = { health: number; focus: number; memory: number; thinking: number; growth: number; adaptability: number };

export type CycleAgg = Domains & {
  cycle_date: string; n: number; score: number; fog_high: number; demand: number; readiness: number;
  bottlenecks: { bottleneck: string; n: number }[];
};

export type TeamCycleAgg =
  | (Domains & { team_id: string; cycle_date: string; n: number; score: number; fog_high: number; demand: number; readiness: number; bottleneck: string; bottleneck_share: number; hidden?: undefined })
  | { team_id: string; cycle_date: string; hidden: true };

export type Team = { id: string; name: string; headcount: number };

export type Dashboard = {
  company: string; minGroup: number; headcount: number;
  teams: Team[]; cycles: CycleAgg[]; teamCycles: TeamCycleAgg[];
};

export const DOMAINS: { key: keyof Domains; letter: string; name: string; meaning: string }[] = [
  { key: "health", letter: "H", name: "Health", meaning: "Tidur, energi, gerak, stres, pola makan" },
  { key: "focus", letter: "F", name: "Focus", meaning: "Menahan perhatian dan distraksi" },
  { key: "memory", letter: "M", name: "Memory", meaning: "Working memory, mengingat informasi baru" },
  { key: "thinking", letter: "T", name: "Thinking", meaning: "Berpikir kritis, solusi, keputusan" },
  { key: "growth", letter: "G", name: "Growth", meaning: "Mindset dan kebiasaan belajar" },
  { key: "adaptability", letter: "A", name: "Adaptability", meaning: "Pulih dan menyesuaikan diri" },
];

/** BrainQ names each person's main bottleneck in English; HR reads them in Indonesian, with one team-level action each. */
const BOTTLENECKS: Record<string, { label: string; action: string }> = {
  "Sleep-driven attention instability": {
    label: "Kurang tidur mengganggu fokus",
    action: "Batasi rapat dan chat kerja setelah jam 19.00, lalu mulai fase Reset (hari 1–7) Brain Upgrade 30 bersama tim.",
  },
  "Cognitive overload, not memory weakness": {
    label: "Beban pikiran berlebih",
    action: "Jadwalkan 2 blok kerja tanpa chat per hari dan kurangi tugas yang berjalan bersamaan.",
  },
  "Fixed-mindset brake on growth": {
    label: "Mindset menahan perkembangan",
    action: "Biasakan review kegagalan tanpa menyalahkan dan beri satu tugas belajar kecil setiap minggu.",
  },
  "Low movement, low mental energy": {
    label: "Kurang bergerak, energi rendah",
    action: "Ajak jalan 10 menit setelah makan siang dan ubah sebagian rapat menjadi rapat sambil berjalan.",
  },
  "Fast intake, unchecked conclusions": {
    label: "Cepat menyimpulkan tanpa cek",
    action: "Pakai aturan 3 alternatif dan satu sumber pembanding sebelum keputusan penting.",
  },
  "Distraction leakage, not focus capacity": {
    label: "Distraksi, bukan kemampuan fokus",
    action: "Matikan notifikasi non-penting saat jam fokus dan sepakati jam balas chat tim.",
  },
};

export const bottleneckLabel = (b: string) => BOTTLENECKS[b]?.label ?? b;
export const bottleneckAction = (b: string) => BOTTLENECKS[b]?.action ?? "Bahas penghambat ini bersama tim dan pilih satu kebiasaan kecil untuk 2 minggu ke depan.";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** "2026-10-15" → "15 Okt". */
export function cycleShort(d: string) {
  const [, m, day] = d.split("-").map(Number);
  return `${day} ${MONTHS[m - 1]}`;
}

/** "2026-10-15" → "15–31 Oktober 2026". Each Pulse cycle runs from the 1st to the 14th or from the 15th to the month's end. */
export function cycleLong(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const end = day === 1 ? 14 : new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${day}–${end} ${MONTHS_LONG[m - 1]} ${y}`;
}

export type TeamRow = {
  team: Team;
  now: Extract<TeamCycleAgg, { hidden?: undefined }> | null;
  prev: Extract<TeamCycleAgg, { hidden?: undefined }> | null;
  hidden: boolean;
  delta: number | null;
  reasons: string[];
};

/** Points of change below which BrainQ calls a score stable, as the Pulse page does. */
export const STABLE = 3;

/** One row per team for a cycle, with the reasons it needs attention (empty when it does not). */
export function teamRows(data: Dashboard, cycle: string, prevCycle: string | null, company: CycleAgg): TeamRow[] {
  const find = (team: string, c: string | null) => data.teamCycles.find((t) => t.team_id === team && t.cycle_date === c);
  return data.teams.map((team) => {
    const cur = find(team.id, cycle);
    const before = find(team.id, prevCycle);
    const now = cur && !cur.hidden ? cur : null;
    const prev = before && !before.hidden ? before : null;
    const delta = now && prev ? now.score - prev.score : null;
    const reasons: string[] = [];
    if (now) {
      if (now.score <= company.score - 5) reasons.push(`BrainQ ${company.score - now.score} poin di bawah rata-rata perusahaan`);
      if (delta !== null && delta <= -STABLE) reasons.push(`turun ${-delta} poin dari siklus lalu`);
      if (now.fog_high >= 35) reasons.push(`brain fog risk tinggi pada ${now.fog_high}% peserta`);
    }
    return { team, now, prev, hidden: !now, delta, reasons };
  });
}

export function lowestDomain(d: Domains) {
  return DOMAINS.reduce((lo, x) => (d[x.key] < d[lo.key] ? x : lo), DOMAINS[0]);
}

/** Company-level advice for the weakest domain. */
export const DOMAIN_ADVICE: Record<keyof Domains, string> = {
  health: "Health paling rendah. Program tidur dan pengurangan lembur akan berdampak lebih besar daripada pelatihan otak.",
  focus: "Focus paling rendah. Lindungi jam kerja tanpa gangguan sebelum menambah target baru.",
  memory: "Memory paling rendah. Biasakan ringkasan tertulis setelah rapat dan kurangi informasi yang hanya disampaikan lisan.",
  thinking: "Thinking paling rendah. Beri waktu untuk menimbang keputusan penting dan latih diskusi berbasis data.",
  growth: "Growth paling rendah. Sediakan waktu belajar mingguan dan rayakan percobaan, bukan hanya hasil.",
  adaptability: "Adaptability paling rendah. Beri jeda pemulihan setelah periode sibuk dan perjelas prioritas saat perubahan.",
};
