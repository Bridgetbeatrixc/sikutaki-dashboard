import { areaById, MOODS } from "./catalog";
import { ENERGY_NOTE, GROUPS, MOVEMENT_NOTE, PRACTICES, practiceById, PROGRAMS, programById } from "./practice";

/*
 * The AI assistant's instructions and the app context it receives. The model may only recommend practices and
 * programs from the catalog, written as tokens the app turns into buttons: [[latihan:id]], [[program:id]],
 * [[psikolog]] and [[bantuan]] (crisis lines).
 */

export type AssistantContext = {
  name: string;
  energy: boolean;
  days: { day: string; mood: number; sleep: number }[];
  todayMood: number | null;
  answers: Record<string, number> | null;
  programs: string[];
};

const SCALE = ["tidak pernah", "jarang", "kadang-kadang", "sering", "hampir selalu"];

export function systemPrompt(c: AssistantContext) {
  const practices = PRACTICES.filter((p) => p.group !== "energi" || c.energy)
    .map((p) => `${p.id} | ${p.title} | ${p.minutes} menit | ${GROUPS.find((g) => g.id === p.group)?.title} | ${p.blurb}${p.caution ? " | latihan gerak" : ""}`).join("\n");
  const programs = PROGRAMS.map((p) => `${p.id} | ${p.title} | ${p.kind === "praktis" ? `2x sehari, ${p.days} hari` : `setiap hari, ${p.days / 7} minggu`} | ${p.blurb}`).join("\n");
  const days = c.days.length ? c.days.map((d) => `${d.day}: mood ${MOODS[d.mood - 1]}, tidur ${d.sleep} jam`).join("; ") : "belum ada catatan";
  const checkin = c.answers ? Object.entries(c.answers).filter(([a]) => areaById(a)).map(([a, v]) => `${areaById(a).name}: ${SCALE[v]}`).join("; ") : "belum mengisi minggu ini";
  const running = c.programs.length ? c.programs.map((id) => programById(id)?.title).join(", ") : "tidak ada";

  return `Kamu adalah Asisten Sikutaki, pendamping latihan mandiri di aplikasi kesejahteraan karyawan di Indonesia.

Aturan:
1. Jawab dalam bahasa Indonesia yang hangat, sederhana, dan singkat (paling banyak sekitar 120 kata). Jangan menghakimi.
2. Kamu bukan psikolog atau dokter. Jangan mendiagnosis, jangan menyimpulkan seseorang punya gangguan tertentu, dan jangan membahas obat atau dosis.
3. Jangan memakai kata "terapi", "menyembuhkan", "obat", "detoks", atau "frekuensi penyembuh". Sebut semuanya "latihan".
4. Sarankan hanya latihan atau program dari katalog di bawah, paling banyak 3. Untuk setiap saran tulis kodenya persis di baris sendiri: [[latihan:ID]] atau [[program:ID]]. Jangan mengarang ID.
5. Bila pengguna menyebut ingin bunuh diri, ingin mati, menyakiti diri, atau sedang dalam bahaya: jangan menyarankan latihan. Tunjukkan kepedulian, minta segera menghubungi Healing119 (telepon 119 ekstensi 8) atau 112 dalam keadaan darurat, sarankan bicara dengan psikolog, dan tulis [[bantuan]] serta [[psikolog]].
6. Bila keluhan terasa berat, mengganggu kerja atau tidur berhari-hari, atau sudah lebih dari dua minggu, sarankan juga bicara dengan psikolog mitra dan tulis [[psikolog]].
7. Untuk latihan gerak, ingatkan: ${MOVEMENT_NOTE}
8. Latihan Energi (bila ada di katalog) selalu disebut sebagai praktik tradisional untuk relaksasi: ${ENERGY_NOTE} Jangan menjanjikan manfaat kesehatan.
9. Jangan sarankan latihan "syukur" bila mood hari ini Berat; pilih latihan napas.
10. Bila kebutuhan belum jelas, tanyakan satu hal saja, misalnya berapa menit waktu yang ada atau kapan keluhannya terasa.
11. Jangan meminta nama lengkap, nama atasan, atau data pribadi lain.

Katalog latihan (id | judul | durasi | kelompok | keterangan):
${practices}

Program (id | judul | jadwal | keterangan):
${programs}

Konteks dari aplikasi, hanya untuk menyesuaikan saran (jangan diulang mentah-mentah):
- Nama panggilan: ${c.name}
- Mood hari ini: ${c.todayMood ? MOODS[c.todayMood - 1] : "belum dicatat"}
- Catatan 7 hari: ${days}
- Check-in minggu ini: ${checkin}
- Program yang sedang berjalan: ${running}`;
}

export type Piece =
  | { kind: "text"; text: string }
  | { kind: "practice"; id: string }
  | { kind: "program"; id: string }
  | { kind: "counsel" }
  | { kind: "crisis" };

/** Splits a reply into text and recommendation cards; unknown ids are dropped. */
export function parseReply(text: string): Piece[] {
  const pieces: Piece[] = [];
  const re = /\[\[(latihan|program):([a-z0-9-]+)\]\]|\[\[(psikolog|bantuan)\]\]/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const before = text.slice(last, m.index).trim();
    if (before) pieces.push({ kind: "text", text: before });
    last = (m.index ?? 0) + m[0].length;
    if (m[1] === "latihan" && practiceById(m[2])) pieces.push({ kind: "practice", id: m[2] });
    else if (m[1] === "program" && programById(m[2])) pieces.push({ kind: "program", id: m[2] });
    else if (m[3] === "psikolog") pieces.push({ kind: "counsel" });
    else if (m[3] === "bantuan") pieces.push({ kind: "crisis" });
  }
  const rest = text.slice(last).trim();
  if (rest) pieces.push({ kind: "text", text: rest });
  // One card per recommendation, even if the model repeats a token.
  const seen = new Set<string>();
  return pieces.filter((p) => {
    if (p.kind === "text") return true;
    const key = p.kind === "practice" || p.kind === "program" ? `${p.kind}:${p.id}` : p.kind;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Words that show the crisis lines at once, before any answer arrives. */
const CRISIS = /bunuh diri|akhiri hidup|mengakhiri hidup|ingin mati|pengen mati|pingin mati|mau mati|tidak ingin hidup|gak mau hidup|nggak mau hidup|menyakiti diri|melukai diri|sayat|self.?harm|suicid/i;
export const isCrisis = (text: string) => CRISIS.test(text);
