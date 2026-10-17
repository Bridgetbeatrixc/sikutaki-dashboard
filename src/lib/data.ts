// Sample data for the prototype: one company, 8 divisions, 12 weeks, 42 areas.
// Everything is deterministic so the prototype looks the same on every load.

export type GroupId = "mood" | "mind" | "energy" | "self" | "habit" | "trait" | "clinical";
export type Status = "baik" | "waspada" | "perhatian";

export const GROUPS: { id: GroupId; name: string; color: string }[] = [
  { id: "mood", name: "Suasana Hati", color: "#2F6BD8" },
  { id: "mind", name: "Pikiran", color: "#C2418F" },
  { id: "energy", name: "Energi & Tidur", color: "#C27510" },
  { id: "self", name: "Diri & Hubungan", color: "#12855F" },
  { id: "habit", name: "Kebiasaan", color: "#7A4FD0" },
  { id: "trait", name: "Sifat & Sikap", color: "#0085A8" },
  { id: "clinical", name: "Indikasi Klinis", color: "#A0521C" },
];
export const groupOf = (id: GroupId) => GROUPS.find((g) => g.id === id)!;

export type Area = { id: string; name: string; alias?: string; group: GroupId; core?: boolean; desc: string };

export const AREAS: Area[] = [
  { id: "sedih", name: "Kesedihan Mendalam", group: "mood", desc: "Rasa sedih yang menetap dan mulai mengganggu aktivitas sehari-hari." },
  { id: "kecewa", name: "Sangat Kecewa", group: "mood", desc: "Kekecewaan mendalam pada pekerjaan, orang lain, atau diri sendiri." },
  { id: "hampa", name: "Perasaan Hampa", alias: "Kosong", group: "mood", desc: "Merasa kosong atau kehilangan makna dalam pekerjaan." },
  { id: "moodswing", name: "Mood Swing Ekstrem", group: "mood", desc: "Suasana hati berubah drastis dalam waktu singkat tanpa sebab yang jelas." },
  { id: "matirasa", name: "Emotional Numbness", alias: "Mati rasa", group: "mood", desc: "Sulit merasakan emosi apa pun, baik senang maupun sedih." },
  { id: "duka", name: "Grief Berkepanjangan", alias: "Duka yang belum selesai", group: "mood", desc: "Duka karena kehilangan yang masih terasa berat setelah waktu yang lama." },
  { id: "apatis", name: "Apatis", alias: "Tidak peduli", group: "mood", desc: "Kehilangan minat dan kepedulian pada pekerjaan, orang lain, atau diri sendiri." },
  { id: "stres", name: "Stres Kronis", group: "mind", core: true, desc: "Tekanan dari pekerjaan dan kehidupan sehari-hari yang terasa terus-menerus." },
  { id: "anxiety", name: "Anxiety", alias: "Kecemasan berlebihan", group: "mind", desc: "Rasa cemas atau khawatir berlebihan yang sulit dikendalikan." },
  { id: "overthinking", name: "Overthinking", group: "mind", desc: "Memikirkan hal yang sama berulang-ulang hingga sulit beristirahat." },
  { id: "panik", name: "Panic Attack", alias: "Serangan panik", group: "mind", desc: "Episode takut yang datang tiba-tiba, sering disertai jantung berdebar atau sesak." },
  { id: "galau", name: "Gelisah Berat", group: "mind", desc: "Rasa gelisah yang kuat sehingga sulit tenang, fokus, atau duduk diam." },
  { id: "disosiasi", name: "Disosiasi Ringan", alias: "Merasa tidak hadir", group: "mind", desc: "Merasa terlepas dari diri sendiri atau sekitar, seperti melihat dari kejauhan." },
  { id: "eksistensial", name: "Krisis Eksistensial", alias: "Krisis makna hidup", group: "mind", desc: "Mempertanyakan arti dan tujuan hidup hingga terasa membebani." },
  { id: "burnout", name: "Burnout", alias: "Kerja atau hidup", group: "energy", core: true, desc: "Kelelahan fisik dan emosional akibat beban kerja atau hidup yang berlangsung lama." },
  { id: "insomnia", name: "Insomnia", alias: "Pikiran terlalu aktif", group: "energy", core: true, desc: "Sulit tidur karena pikiran aktif, sering terbangun, atau bangun tanpa merasa segar." },
  { id: "baterai", name: "Baterai Sosial", alias: "Energi sosial terkuras", group: "energy", desc: "Seberapa terkuras energi untuk berinteraksi dengan orang lain." },
  { id: "minder", name: "Minder", group: "self", desc: "Rasa kurang percaya diri atau merasa tidak cukup baik dibanding orang lain." },
  { id: "selfesteem", name: "Low Self-Esteem", alias: "Merasa tidak berharga", group: "self", desc: "Merasa diri tidak berharga atau tidak layak dihargai." },
  { id: "impostor", name: "Impostor Syndrome", alias: "Merasa \u201cpalsu\u201d", group: "self", desc: "Merasa keberhasilan bukan karena kemampuan sendiri dan takut suatu saat ketahuan." },
  { id: "trauma", name: "Trauma Psikologis", group: "self", desc: "Dampak pengalaman berat di masa lalu yang masih terasa sampai sekarang." },
  { id: "dendam", name: "Rasa Dendam", group: "self", desc: "Sakit hati yang belum selesai dan terus teringat." },
  { id: "marah", name: "Anger Issue", alias: "Emosi mudah meledak", group: "self", desc: "Amarah yang mudah meledak, atau justru dipendam dan tidak tersalurkan dengan sehat." },
  { id: "sosial", name: "Social Anxiety", alias: "Takut interaksi sosial", group: "self", desc: "Rasa takut atau sangat tidak nyaman saat berinteraksi atau dinilai orang lain." },
  { id: "relasi", name: "Relationship Anxiety", alias: "Takut ditinggal", group: "self", desc: "Khawatir berlebihan akan ditinggalkan atau kehilangan orang terdekat." },
  { id: "pleaser", name: "People Pleasing", group: "self", desc: "Sulit menolak dan terus mendahulukan keinginan orang lain hingga mengabaikan diri sendiri." },
  { id: "cemburu", name: "Jealousy Insecurity", alias: "Cemburu dan merasa tidak aman", group: "self", desc: "Cemburu yang disertai rasa tidak aman, dalam hubungan maupun di tempat kerja." },
  { id: "perfeksionis", name: "Perfeksionisme Obsesif", group: "habit", desc: "Menuntut hasil sempurna hingga sulit menyelesaikan pekerjaan dan mudah kecewa pada diri sendiri." },
  { id: "fomo", name: "FOMO", alias: "Takut tertinggal", group: "habit", desc: "Takut tertinggal dari pengalaman atau pencapaian orang lain." },
  { id: "gadget", name: "Kecanduan Digital", alias: "Kecanduan gadget", group: "habit", desc: "Sulit lepas dari ponsel atau media sosial hingga mengganggu tidur, kerja, atau hubungan." },
  { id: "prokrastinasi", name: "Prokrastinasi Kronis", group: "habit", desc: "Terus menunda pekerjaan penting walau tahu dampaknya." },
  { id: "makan", name: "Emotional Eating", alias: "Pola makan emosional", group: "habit", desc: "Makan berlebihan, atau justru tidak makan, sebagai pelarian dari emosi." },
  { id: "egois", name: "Egois", group: "trait", desc: "Cenderung mendahulukan kepentingan sendiri dan sulit melihat sudut pandang orang lain." },
  { id: "sombong", name: "Sombong/Angkuh", group: "trait", desc: "Cenderung merasa lebih tinggi dari orang lain dan sulit menerima masukan." },
  { id: "keras", name: "Keras Kepala", group: "trait", desc: "Sulit mengubah pendapat atau cara kerja walau ada alasan kuat untuk berubah." },
  { id: "ambisius", name: "Ambisius", group: "trait", desc: "Dorongan berprestasi yang sangat tinggi hingga menekan diri sendiri atau orang lain." },
  { id: "depresi", name: "Depresi", alias: "Gejala depresi", group: "clinical", desc: "Indikasi gejala depresi seperti kehilangan minat dan energi yang berkepanjangan. Sinyal skrining, bukan diagnosis." },
  { id: "bipolar", name: "Bipolar", alias: "Gejala bipolar", group: "clinical", desc: "Indikasi perubahan suasana hati ekstrem antara sangat bersemangat dan sangat terpuruk, masing-masing berlangsung berhari-hari. Sinyal skrining, bukan diagnosis." },
  { id: "adhd", name: "ADHD", alias: "Sulit fokus dan impulsif", group: "clinical", desc: "Indikasi sulit memusatkan perhatian, gelisah, dan bertindak impulsif secara menetap. Sinyal skrining, bukan diagnosis." },
  { id: "skizofrenia", name: "Skizofrenia", alias: "Gejala psikotik", group: "clinical", desc: "Indikasi pengalaman persepsi yang tidak biasa, seperti mendengar atau melihat hal yang tidak dialami orang lain. Sinyal skrining, bukan diagnosis." },
  { id: "narsistik", name: "Narsistik/NPD", alias: "Kebutuhan validasi", group: "clinical", desc: "Kecenderungan sangat membutuhkan pengakuan atau pujian dan kurang berempati. Sinyal skrining, bukan diagnosis." },
  { id: "psikopat", name: "Psikopat", alias: "Empati rendah", group: "clinical", desc: "Indikasi empati dan rasa bersalah yang sangat rendah. Sinyal skrining, bukan diagnosis." },
];
export const AREA_COUNT = AREAS.length;
export const areaById = (id: string) => AREAS.find((a) => a.id === id)!;

export type Team = { id: string; name: string; size: number; lead: string };
export const TEAMS: Team[] = [
  { id: "ops", name: "Operasional", size: 120, lead: "Budi S." },
  { id: "cs", name: "Layanan Pelanggan", size: 98, lead: "Maya R." },
  { id: "sales", name: "Penjualan", size: 86, lead: "Andre W." },
  { id: "tech", name: "Teknologi", size: 72, lead: "Sinta P." },
  { id: "mkt", name: "Pemasaran", size: 58, lead: "Dewi L." },
  { id: "fin", name: "Keuangan", size: 34, lead: "Hendra K." },
  { id: "hr", name: "SDM", size: 18, lead: "Rina A." },
  { id: "legal", name: "Legal", size: 4, lead: "Tono H." },
];
export const teamById = (id: string) => TEAMS.find((t) => t.id === id)!;
export const MIN_GROUP = 5;

export const COMPANY = { name: "PT Contoh Nusantara", employees: TEAMS.reduce((s, t) => s + t.size, 0) };

// 12 weekly check-ins, Mondays from 20 Jul to 5 Oct 2026.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const WEEKS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 6, 20 + i * 7));
  return { i, label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`, short: `M${i + 1}` };
});
export const NOW = WEEKS.length - 1;

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

export const VAL: Record<string, Record<string, number[]>> = {};
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
export const PART: Record<string, number[]> = {};
for (const t of TEAMS) {
  PART[t.id] = WEEKS.map((_, w) => {
    let p = partBase[t.id] + (rand(w, 3, t.size) - 0.5) * 8 + (w < 2 ? -8 : 0);
    if (t.id === "mkt" && w >= 9) p = 58 - (w - 9) * 6; // dropping
    return Math.round(Math.max(30, Math.min(99, p)));
  });
}

export const respondents = (teamId: string, w = NOW) => Math.round((teamById(teamId).size * PART[teamId][w]) / 100);
export const isHidden = (teamId: string, w = NOW) => respondents(teamId, w) < MIN_GROUP;

// Scope = whole company or one team. Hidden teams are excluded from company averages shown per team,
// but still count toward the company total (they are inside a large enough group there).
export type Scope = "all" | string;
const scopeTeams = (s: Scope) => (s === "all" ? TEAMS : TEAMS.filter((t) => t.id === s));

export function areaValue(s: Scope, area: string, w = NOW): number {
  const ts = scopeTeams(s);
  let sum = 0, n = 0;
  for (const t of ts) { const r = respondents(t.id, w); sum += VAL[t.id][area][w] * r; n += r; }
  return n ? Math.round(sum / n) : 0;
}
export const areaSeries = (s: Scope, area: string) => WEEKS.map((_, w) => areaValue(s, area, w));

export function wellbeing(s: Scope, w = NOW): number {
  // Core areas (measured weekly) weigh 3x; rotating areas 1x
  let sum = 0, wt = 0;
  for (const a of AREAS) { const k = a.core ? 3 : 1; sum += areaValue(s, a.id, w) * k; wt += k; }
  return Math.round(Math.max(0, Math.min(100, 114 - (sum / wt) * 1.15)));
}
export const wellbeingSeries = (s: Scope) => WEEKS.map((_, w) => wellbeing(s, w));

export function participation(s: Scope, w = NOW): number {
  const ts = scopeTeams(s);
  const resp = ts.reduce((acc, t) => acc + respondents(t.id, w), 0);
  const size = ts.reduce((acc, t) => acc + t.size, 0);
  return Math.round((resp / size) * 100);
}
export const participationSeries = (s: Scope) => WEEKS.map((_, w) => participation(s, w));
export const respondentsScope = (s: Scope, w = NOW) => scopeTeams(s).reduce((acc, t) => acc + respondents(t.id, w), 0);
export const sizeScope = (s: Scope) => scopeTeams(s).reduce((acc, t) => acc + t.size, 0);

export const areaStatus = (v: number): Status => (v >= 62 ? "perhatian" : v >= 52 ? "waspada" : "baik");
export const wellbeingStatus = (v: number): Status => (v < 55 ? "perhatian" : v < 63 ? "waspada" : "baik");
export const STATUS_LABEL: Record<Status, string> = { baik: "Baik", waspada: "Waspada", perhatian: "Perlu perhatian" };

export function teamStatus(teamId: string): Status {
  const top = Math.max(...AREAS.map((a) => VAL[teamId][a.id][NOW]));
  const wb = wellbeing(teamId);
  if (top >= 62 || wb < 55) return "perhatian";
  if (top >= 54 || wb < 63) return "waspada";
  return "baik";
}
export function topAreas(s: Scope, n = 3, w = NOW) {
  return AREAS.map((a) => ({ area: a, v: areaValue(s, a.id, w), d: areaValue(s, a.id, w) - areaValue(s, a.id, w - 2) }))
    .sort((x, y) => y.v - x.v).slice(0, n);
}
export function movers(s: Scope) {
  return AREAS.map((a) => ({ area: a, d: areaValue(s, a.id) - areaValue(s, a.id, NOW - 4) })).sort((x, y) => y.d - x.d);
}

// Share of respondents at each level, derived from the mean (sample approximation).
export function severity(v: number) {
  const tinggi = Math.round(Math.max(3, Math.min(70, (v - 30) * 1.25)));
  const rendah = Math.round(Math.max(5, Math.min(85, (72 - v) * 1.45)));
  return { rendah, sedang: Math.max(0, 100 - tinggi - rendah), tinggi };
}

// Alerts: a change of 5+ points over 2 weeks, or a level in "Perlu perhatian", or low participation.
export type Alert = { id: string; team: string; kind: "naik" | "tinggi" | "partisipasi"; area?: string; value: number; delta: number; text: string };
export function alerts(): Alert[] {
  const out: Alert[] = [];
  for (const t of TEAMS) {
    if (isHidden(t.id)) continue;
    const p = PART[t.id][NOW];
    if (p < 60) out.push({ id: `${t.id}-part`, team: t.id, kind: "partisipasi", value: p, delta: p - PART[t.id][NOW - 2], text: `Partisipasi ${t.name} turun ke ${p}%` });
    for (const a of AREAS) {
      const v = VAL[t.id][a.id][NOW], d = v - VAL[t.id][a.id][NOW - 2];
      if (d >= 5 && v >= 52) out.push({ id: `${t.id}-${a.id}`, team: t.id, kind: "naik", area: a.id, value: v, delta: d, text: `${a.name} naik ${d} poin di ${t.name}` });
      else if (v >= 62) out.push({ id: `${t.id}-${a.id}`, team: t.id, kind: "tinggi", area: a.id, value: v, delta: d, text: `${a.name} tinggi di ${t.name}` });
    }
  }
  const rank = (x: Alert) => (x.kind === "naik" ? 0 : x.kind === "tinggi" ? 1 : 2) * 1000 - x.value;
  return out.sort((x, y) => rank(x) - rank(y));
}

export const REFERRALS = { thisMonth: 7, lastMonth: 5, byMonth: [3, 4, 5, 7] as number[], months: ["Jul", "Agu", "Sep", "Okt"] };

export const PARTNERS = [
  { name: "Dita Anggraini, M.Psi., Psikolog", focus: "Stres kerja, burnout", slots: "Sen-Jum, 18.00-21.00" },
  { name: "Raka Pratama, M.Psi., Psikolog", focus: "Kecemasan, serangan panik", slots: "Sel & Kam, 19.00-21.00" },
  { name: "Layanan Konseling Mitra (24 jam)", focus: "Krisis dan rujukan lanjutan", slots: "Setiap hari" },
];

// Question rotation: 3 core areas every week + 5 rotating, so every other area comes back every 8 weeks.
export const CORE = ["stres", "burnout", "insomnia"];
export const ROTATING_PER_WEEK = 5;
const ROT = AREAS.map((a) => a.id).filter((id) => !CORE.includes(id));
export const ROTATION = Array.from({ length: Math.ceil(ROT.length / ROTATING_PER_WEEK) }, (_, i) => ROT.slice(i * ROTATING_PER_WEEK, (i + 1) * ROTATING_PER_WEEK));
