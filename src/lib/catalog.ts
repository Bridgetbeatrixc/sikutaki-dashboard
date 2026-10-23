// What Sikutaki measures: 42 areas in 7 groups, the weekly question rotation, the follow-up causes,
// status thresholds and HR note types. Shared by the HR dashboard, the employee app and the server.

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
  { id: "baterai", name: "Kelelahan Sosial", alias: "Baterai sosial terkuras", group: "energy", desc: "Seberapa sering energi habis setelah berinteraksi dengan orang lain. Skor tinggi berarti baterai sosial terkuras (kapasitasnya sedang rendah), bukan berarti banyak bersosialisasi." },
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

/** HR never sees a number from a group smaller than this. Companies can raise it, never lower it. */
export const MIN_GROUP = 5;

export const areaStatus = (v: number): Status => (v >= 62 ? "perhatian" : v >= 52 ? "waspada" : "baik");
export const STATUS_LABEL: Record<Status, string> = { baik: "Baik", waspada: "Waspada", perhatian: "Perlu perhatian" };

/*
 * How scores are read. Every answer is a frequency on a 5-point scale, so an area score (0-100) is the average
 * frequency: 0 = "Tidak pernah", 25 = "Jarang", 50 = "Kadang-kadang", 75 = "Sering", 100 = "Hampir selalu".
 * Higher always means "happens more often, needs more attention".
 *
 * The wellbeing index turns that around (100 minus the weighted average), the way the WHO-5 Well-Being Index
 * turns its 0-25 raw score into 0-100 (Topp et al., 2015): 100 means none of the measured complaints happened.
 */
export const SCORE_ANCHORS = [
  { v: 0, label: "Tidak pernah" }, { v: 25, label: "Jarang" }, { v: 50, label: "Kadang-kadang" }, { v: 75, label: "Sering" }, { v: 100, label: "Hampir selalu" },
];
/** "antara Jarang dan Kadang-kadang" for an area score. */
export function scoreMeaning(v: number) {
  const i = Math.min(3, Math.floor(v / 25));
  const lo = SCORE_ANCHORS[i], hi = SCORE_ANCHORS[i + 1];
  if (v - lo.v <= 5) return `rata-rata \u201C${lo.label}\u201D`;
  if (hi.v - v <= 5) return `rata-rata \u201C${hi.label}\u201D`;
  return `antara \u201C${lo.label}\u201D dan \u201C${hi.label}\u201D`;
}

export type Band = { min: number; label: string; status: Status; text: string };
/** Wellbeing index categories, from the best. Each band is 15 points of average complaint frequency. */
export const WELLBEING_BANDS: Band[] = [
  { min: 80, label: "Sangat baik", status: "baik", text: "Keluhan rata-rata jarang atau tidak pernah muncul." },
  { min: 65, label: "Baik", status: "baik", text: "Keluhan rata-rata jarang muncul." },
  { min: 50, label: "Cukup", status: "waspada", text: "Keluhan rata-rata muncul antara jarang dan kadang-kadang. Perlu dipantau." },
  { min: 35, label: "Rendah", status: "perhatian", text: "Keluhan rata-rata muncul kadang-kadang atau lebih. Perlu tindakan." },
  { min: 0, label: "Sangat rendah", status: "perhatian", text: "Keluhan rata-rata sering muncul. Perlu tindakan segera." },
];
export const wellbeingBand = (v: number) => WELLBEING_BANDS.find((b) => v >= b.min)!;
export const wellbeingStatus = (v: number): Status => wellbeingBand(v).status;

/** Wellbeing index 0-100 from the area scores of one week: core areas (asked every week) weigh 3x. */
export function wellbeingFrom(scores: Record<string, number>): number | null {
  let sum = 0, wt = 0;
  for (const a of AREAS) {
    const v = scores[a.id];
    if (v === undefined) continue;
    const k = a.core ? 3 : 1;
    sum += v * k; wt += k;
  }
  return wt ? Math.round(Math.max(0, Math.min(100, 100 - sum / wt))) : null;
}

/*
 * Is a change meaningful? On the WHO-5 0-100 scale a change of 10 points is taken as clinically relevant
 * (Topp et al., 2015), and half a standard deviation is a common threshold for a change people notice
 * (Norman, Sloan & Wyrwich, 2003). Group averages of few people move more by chance, so small groups are flagged.
 */
export type ChangeLevel = "stabil" | "kecil" | "bermakna";
export function changeMeaning(d: number, n?: number): { level: ChangeLevel; label: string; text: string } {
  const a = Math.abs(d);
  const few = n !== undefined && n < 20 ? " Jumlah penjawab sedikit, jadi angkanya mudah naik-turun." : "";
  if (a < 5) return { level: "stabil", label: "Stabil", text: `Perubahan ${a} poin masih dalam naik-turun biasa, belum perlu ditanggapi.${few}` };
  if (a < 10) return { level: "kecil", label: "Perubahan kecil", text: `Perubahan ${a} poin tergolong kecil. Pantau di periode berikutnya sebelum mengambil kesimpulan.${few}` };
  return { level: "bermakna", label: "Perubahan bermakna", text: `Perubahan ${a} poin tergolong bermakna (10 poin atau lebih).${few}` };
}

export const SCORE_BASIS = [
  "Skor area 0 sampai 100 adalah rata-rata frekuensi jawaban: 0 Tidak pernah, 25 Jarang, 50 Kadang-kadang, 75 Sering, 100 Hampir selalu. Makin tinggi makin perlu perhatian.",
  "Indeks wellbeing = 100 dikurangi rata-rata skor area (stres, burnout, dan tidur berbobot 3x karena ditanyakan setiap minggu). Makin tinggi makin baik. Cara mengubah skala ke 0 sampai 100 mengikuti WHO-5 Well-Being Index (Topp dkk., 2015, Psychotherapy and Psychosomatics 84:167-176).",
  "Perubahan 10 poin atau lebih dianggap bermakna, mengikuti ambang perubahan WHO-5 (Topp dkk., 2015) dan aturan setengah simpangan baku (Norman, Sloan & Wyrwich, 2003, Medical Care 41:582-592). Perubahan di bawah 5 poin dianggap naik-turun biasa.",
  "Indeks Sikutaki belum divalidasi secara klinis seperti WHO-5. Pakai sebagai alat pantau tren, bukan diagnosis.",
];

/* ---------- Weekly question rotation ---------- */

// 3 core areas every week + 5 rotating, so every other area comes back every 8 weeks.
export const CORE = ["stres", "burnout", "insomnia"];
export const ROTATING_PER_WEEK = 5;
const ROT = AREAS.map((a) => a.id).filter((id) => !CORE.includes(id));
export const ROTATION = Array.from({ length: Math.ceil(ROT.length / ROTATING_PER_WEEK) }, (_, i) => ROT.slice(i * ROTATING_PER_WEEK, (i + 1) * ROTATING_PER_WEEK));
/** The areas asked in the week with this rotation index. */
export const checkinAreas = (rotation: number) => [...CORE, ...ROTATION[((rotation % ROTATION.length) + ROTATION.length) % ROTATION.length]];

/** Answer scale of the weekly check-in, scored 0 to 4. */
export const SCALE = ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Hampir selalu"];
export const SCALE_MAX = SCALE.length - 1;
/** One answer as an area score from 0 to 100. */
export const answerScore = (v: number) => (v / SCALE_MAX) * 100;
/** rendah (0-1), sedang (2), tinggi (3-4); the same split the employee sees in Insight. */
export const answerLevel = (v: number): 0 | 1 | 2 => (v >= 3 ? 2 : v === 2 ? 1 : 0);

/* ---------- Follow-up question: what causes it ---------- */

/** Asked to respondents who score medium or high on an area, multiple choice, anonymous. */
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
  lainnya: { id: "lainnya", label: "Lainnya", idea: "Tanyakan langsung ke divisi lewat obrolan santai atau survei singkat, karena penyebabnya di luar daftar" },
};
/** Id of the "Lainnya" choice. Its free text stays with the employee; HR only sees how many picked it. */
export const OTHER_CAUSE = "lainnya";
const AREA_CAUSES: Record<string, string[]> = {
  burnout: ["shift", "pelanggan", "after", "volume", "recovery", "pribadi"],
  insomnia: ["shift", "after", "pikiran", "layar", "pribadi"],
  stres: ["volume", "prioritas", "pelanggan", "after", "pribadi"],
  anxiety: ["volume", "prioritas", "pelanggan", "atasan", "pribadi"],
  overthinking: ["prioritas", "after", "pikiran", "pribadi"],
  baterai: ["pelanggan", "recovery", "volume", "shift"],
};
const DEFAULT_CAUSES = ["atasan", "volume", "pengakuan", "pribadi"];
/** The causes offered for an area. */
export const causesFor = (area: string) => [...(AREA_CAUSES[area] ?? DEFAULT_CAUSES), OTHER_CAUSE];

export function followUpQuestion(area: string) {
  if (area === "burnout" || area === "baterai") return "Apa yang paling menguras energimu minggu ini?";
  if (area === "insomnia") return "Apa yang paling sering membuatmu sulit tidur minggu ini?";
  if (["stres", "anxiety", "overthinking", "panik"].includes(area)) return "Apa sumber tekanan terbesarmu minggu ini?";
  return "Apa yang paling memengaruhi perasaan ini minggu ini?";
}

/**
 * The area the follow-up question asks about: the highest answer of 2 ("Kadang-kadang") or more,
 * core areas first on a tie. Null when every answer is low.
 */
export function followUpArea(areas: string[], answers: Record<string, number>): string | null {
  let best: string | null = null;
  for (const a of areas) if ((answers[a] ?? 0) >= 2 && (best === null || answers[a] > answers[best])) best = a;
  return best;
}

/* ---------- Daily mood ---------- */

/** Daily mood answers, from heaviest to best (1 to 5). */
export const MOODS = ["Berat", "Kurang", "Biasa", "Baik", "Sangat baik"];

/* ---------- HR notes ---------- */

export type NoteType = "dilakukan" | "rencana" | "pantau";
export const NOTE_LABEL: Record<NoteType, string> = { dilakukan: "Sudah dilakukan", rencana: "Rencana", pantau: "Dipantau" };
export const NOTE_TYPES = Object.keys(NOTE_LABEL) as NoteType[];
