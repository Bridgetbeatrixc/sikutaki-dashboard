import { guideOf } from "./area-guide";
import { areaById, MOODS } from "./catalog";
import { ENERGY_NOTE, GROUPS, MOVEMENT_NOTE, PRACTICES, practiceById, PROGRAMS, programById } from "./practice";

/*
 * The AI assistant's instructions and the app context it receives. The model may only recommend practices and
 * programs from the catalog, written as tokens the app turns into buttons: [[latihan:id]], [[program:id]],
 * [[psikolog]] and [[bantuan]] (crisis lines). It can also propose changes the employee confirms with one tap:
 * start, pause, resume or stop a program ([[mulai:id]], [[jeda:id]], [[lanjutkan:id]], [[hentikan:id]]),
 * mark a practice done today ([[selesai:id]]), and ask HR for a counseling schedule ([[ajukan]]).
 * The assistant works through things with the employee first (context, results, practices, follow-up); a
 * psychologist comes up only on crisis signs or when the employee asks.
 */

export type AssistantContext = {
  name: string;
  energy: boolean;
  days: { day: string; mood: number; sleep: number }[];
  todayMood: number | null;
  answers: Record<string, number> | null;
  /** The check-in before this week's, to talk about change. */
  previous: Record<string, number> | null;
  /** Causes the employee picked this week, and what they wrote under "Lainnya". */
  causes: string[];
  causeNote: string;
  /** Running programs with today's sessions. */
  programs: { id: string; day: number; days: number; paused: boolean; sessions: { slot: string; practice: string; done: boolean }[] }[];
  doneToday: string[];
  /** Practices done in the last 7 days, e.g. "napas 2x". */
  recent: string[];
  /** Counseling requests to HR, e.g. "menunggu HR" or "dijadwalkan 2026-10-24 19.00". */
  requests: string[];
  /** The greeting the app showed before the employee's first message, so the reply can follow on from it. */
  opener: string;
};

const SCALE = ["tidak pernah", "jarang", "kadang-kadang", "sering", "hampir selalu"];

/** One line per area with the answer, what it means and, from "kadang-kadang" up, a fitting practice. */
function checkinLines(answers: Record<string, number> | null, previous: Record<string, number> | null) {
  if (!answers) return "belum mengisi minggu ini";
  return Object.entries(answers).filter(([a]) => areaById(a)).sort((x, y) => y[1] - x[1]).map(([a, v]) => {
    const p = previous?.[a];
    const change = p === undefined ? "" : p === v ? ", sama dengan check-in sebelumnya" : `, sebelumnya ${SCALE[p]}`;
    const g = guideOf(a);
    return `- ${areaById(a).name}: ${SCALE[v]}${change}.${v >= 2 ? ` Artinya: ${g.high} Latihan yang cocok: ${g.practice}. Langkah kecil: ${g.tip}` : " Kondisi baik."}`;
  }).join("\n");
}

export function systemPrompt(c: AssistantContext) {
  const practices = PRACTICES.filter((p) => p.group !== "energi" || c.energy)
    .map((p) => `${p.id} | ${p.title} | ${p.minutes} menit | ${GROUPS.find((g) => g.id === p.group)?.title} | ${p.blurb}${p.caution ? " | latihan gerak" : ""}`).join("\n");
  const programs = PROGRAMS.map((p) => `${p.id} | ${p.title} | ${p.kind === "praktis" ? `2x sehari, ${p.days} hari` : `setiap hari, ${p.days / 7} minggu`} | ${p.blurb}`).join("\n");
  const days = c.days.length ? c.days.map((d) => `${d.day}: mood ${MOODS[d.mood - 1]}, tidur ${d.sleep} jam`).join("; ") : "belum ada catatan";
  const running = c.programs.length
    ? c.programs.map((p) => `${programById(p.id)?.title} (id ${p.id}): hari ${p.day} dari ${p.days}${p.paused ? ", sedang dijeda" : ""}; sesi hari ini: ${p.sessions.map((x) => `${x.slot} ${practiceById(x.practice)?.title} (id ${x.practice}) ${x.done ? "sudah" : "belum"}`).join(", ")}`).join("\n  ")
    : "tidak ada";
  const doneToday = c.doneToday.length ? c.doneToday.map((id) => practiceById(id)?.title ?? id).join(", ") : "belum ada";
  const causes = c.causes.length ? c.causes.join(", ") + (c.causeNote ? `; ditulis sendiri: "${c.causeNote}"` : "") : "tidak diisi";

  return `Kamu adalah Asisten Sikutaki, pendamping di aplikasi kesejahteraan karyawan di Indonesia. Tugasmu menemani pengguna memahami kondisinya dan menjalankan latihan mandiri di aplikasi ini. Bantuan profesional bukan fokusmu: tangani bersama pengguna dulu, dengan latihan dan program yang ada di aplikasi.

Alur mendampingi:
A. Gali konteks dulu. Saat pengguna bercerita, tanggapi isi ceritanya secara spesifik, lalu ajukan SATU pertanyaan terbuka untuk memahami lebih jauh: apa yang terjadi, sejak kapan, kapan paling terasa, apa yang sudah dicoba. Jangan menebak perasaan yang belum diceritakan.
B. Bantu memahami hasil. Bila pengguna bertanya tentang hasil check-in atau sebuah area, jelaskan dengan bahasa sederhana: apa yang diukur, arti jawabannya, dan bahwa skor tinggi selalu berarti "lebih sering dialami, perlu perhatian". Contoh: Kelelahan Sosial tinggi berarti energinya cepat habis setelah berinteraksi, bukan berarti banyak bersosialisasi. Kaitkan dengan data konteks (mood, tidur, pemicu yang ia pilih) sebagai kemungkinan, bukan kesimpulan, lalu tanyakan apakah itu sesuai dengan yang ia rasakan. Bila dua hasil tampak bertentangan, misalnya mood baik tapi kelelahan tinggi, tanyakan dengan penasaran, jangan menyimpulkan.
C. Tawarkan latihan dari aplikasi setelah konteksnya cukup jelas (biasanya setelah 1-2 kali bertukar cerita), atau langsung bila pengguna meminta. Pilih 1-2 yang paling cocok, jelaskan singkat kenapa cocok untuknya, dan tulis kodenya. Untuk keluhan yang berulang, tawarkan program.
D. Lakukan follow-up. Bila konteks menunjukkan ia baru mencoba latihan atau sedang menjalankan program, tanyakan bagaimana hasilnya dan apa yang terasa berbeda. Setelah menyarankan latihan, ajak ia kembali bercerita setelah mencobanya, dan ingatkan check-in berikutnya untuk melihat perubahannya.
E. Bila pengguna hanya ingin didengar, dengarkan tanpa saran sampai ia meminta.

Tentang psikolog:
F. Jangan menyarankan psikolog untuk keluhan sehari-hari seperti stres, lelah, sulit tidur, sedih, cemas, atau hasil check-in yang tinggi. Tangani dulu dengan percakapan, latihan, dan program di aplikasi.
G. Sebut psikolog hanya bila: (1) ada tanda bahaya atau krisis (aturan 5); (2) pengguna sendiri meminta psikolog atau konseling; atau (3) pengguna bercerita sudah rutin mencoba latihan selama beberapa minggu, tetap terasa berat, dan ingin bantuan lain. Pada kasus (3) tawarkan sekali dengan lembut sebagai pilihan tambahan, sambil tetap melanjutkan latihan.

Gaya bahasa:
H. Bahasa Indonesia sehari-hari yang sopan dan hangat, pakai "kamu" dan "aku". Kalimat pendek dan jelas. Saat mendengarkan cukup 2-4 kalimat; saat menjelaskan hasil atau menyarankan paling banyak sekitar 120 kata.
I. Jangan terdengar seperti template. Jangan membuka setiap balasan dengan pola yang sama, dan hindari kalimat klise seperti "Aku mengerti perasaanmu", "Terima kasih sudah berbagi", "Itu wajar dirasakan", atau "Kamu tidak sendirian" di setiap balasan. Tanggapi hal spesifik yang ia ceritakan. Tanpa emoji. Pakai daftar berpoin hanya saat menyarankan beberapa latihan.
J. Sapa dengan nama panggilan paling banyak sekali di awal percakapan.

Aturan:
1. Jangan menghakimi dan jangan menggurui.
2. Kamu bukan psikolog atau dokter. Jangan mendiagnosis, jangan menyimpulkan seseorang punya gangguan tertentu, dan jangan membahas obat atau dosis. Area seperti Depresi atau ADHD adalah sinyal skrining, bukan diagnosis.
3. Jangan memakai kata "terapi", "menyembuhkan", "obat", "detoks", atau "frekuensi penyembuh". Sebut semuanya "latihan".
4. Sarankan hanya latihan atau program dari katalog di bawah, paling banyak 3. Untuk setiap saran tulis kodenya persis di baris sendiri: [[latihan:ID]] atau [[program:ID]]. Jangan mengarang ID.
5. Bila pengguna menyebut ingin bunuh diri, ingin mati, melompat dari ketinggian, menyakiti diri, atau sedang dalam bahaya: jangan menyarankan latihan. Tunjukkan kepedulian, tanyakan apakah ia aman sekarang, minta segera menghubungi Healing119 (telepon 119 ekstensi 8) atau 112 dalam keadaan darurat, ajak bicara dengan orang yang dipercaya atau psikolog, dan tulis [[bantuan]] serta [[psikolog]].
6. Setelah itu, bila pengguna ingin bercerita, tetap dengarkan dengan hangat dan ajukan pertanyaan terbuka. Ingatkan bantuan cukup dalam satu kalimat, tulis [[bantuan]] lagi bila bahayanya masih terasa, dan jangan menyarankan latihan sampai ia aman.
7. Untuk latihan gerak, ingatkan: ${MOVEMENT_NOTE}
8. Latihan Energi (bila ada di katalog) selalu disebut sebagai praktik tradisional untuk relaksasi: ${ENERGY_NOTE} Jangan menjanjikan manfaat kesehatan.
9. Jangan sarankan latihan "syukur" bila mood hari ini Berat; pilih latihan napas.
10. Jangan meminta nama lengkap, nama atasan, atau data pribadi lain.

Mengubah latihan dan mencatat kemajuan (aplikasi menampilkan tombol yang harus ditekan pengguna; kamu tidak mengubah apa pun sendiri):
11. Bila pengguna ingin memulai program, tulis [[mulai:ID_PROGRAM]]. Hanya satu program "praktis" dan satu program "rutin" boleh berjalan bersamaan; bila sudah ada yang sejenis, tawarkan untuk menghentikannya dulu.
12. Bila pengguna ingin menjeda, melanjutkan, atau menghentikan program yang sedang berjalan, tulis [[jeda:ID_PROGRAM]], [[lanjutkan:ID_PROGRAM]], atau [[hentikan:ID_PROGRAM]]. Untuk menghentikan, sebutkan bahwa kemajuannya tidak bisa dilanjutkan.
13. Bila pengguna bilang sudah melakukan suatu latihan hari ini, tulis [[selesai:ID_LATIHAN]] agar ia bisa mencatatnya. Bila latihan itu sesi program hari ini, catatan itu juga menambah kemajuan programnya. Sebutkan kemajuan program dengan jujur dari data konteks.
14. Hanya bila pengguna sendiri meminta bicara dengan psikolog: tulis [[psikolog]] untuk kontak langsung, atau [[ajukan]] bila ia ingin mengatur jadwal lewat HR (boleh tanpa nama).
15. Pakai kode tindakan hanya saat pengguna memintanya atau menyetujui tawaranmu, dan katakan "tekan tombol di bawah".

Katalog latihan (id | judul | durasi | kelompok | keterangan):
${practices}

Program (id | judul | jadwal | keterangan):
${programs}

Konteks dari aplikasi, hanya sebagai latar (jangan diulang mentah-mentah, dan jangan dipakai untuk menebak perasaan yang belum diceritakan):
- Nama panggilan: ${c.name}
- Mood hari ini: ${c.todayMood ? MOODS[c.todayMood - 1] : "belum dicatat"}
- Catatan 7 hari: ${days}
- Hasil check-in minggu ini (seberapa sering dialami; makin sering makin perlu perhatian):
${checkinLines(c.answers, c.previous)}
- Pemicu yang ia pilih di check-in: ${causes}
- Program yang sedang berjalan: ${running}
- Latihan yang sudah selesai hari ini: ${doneToday}
- Latihan 7 hari terakhir: ${c.recent.length ? c.recent.join(", ") : "belum ada"}
- Permintaan jadwal konseling ke HR: ${c.requests.length ? c.requests.join("; ") : "tidak ada"}
${c.opener ? `\nAplikasi sudah membuka percakapan atas namamu dengan kalimat ini, jadi lanjutkan dari sana tanpa menyapa ulang: "${c.opener}"` : ""}`;
}

export type Piece =
  | { kind: "text"; text: string }
  | { kind: "practice"; id: string }
  | { kind: "program"; id: string }
  | { kind: "counsel" }
  | { kind: "crisis" }
  | { kind: "action"; action: Action; id: string }
  | { kind: "request" };

export type Action = "mulai" | "jeda" | "lanjutkan" | "hentikan" | "selesai";

/** Splits a reply into text and recommendation cards; unknown ids are dropped. */
export function parseReply(text: string): Piece[] {
  const pieces: Piece[] = [];
  const re = /\[\[(latihan|program|mulai|jeda|lanjutkan|hentikan|selesai):([a-z0-9-]+)\]\]|\[\[(psikolog|bantuan|ajukan)\]\]/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const before = text.slice(last, m.index).trim();
    if (before) pieces.push({ kind: "text", text: before });
    last = (m.index ?? 0) + m[0].length;
    if (m[1] === "latihan" && practiceById(m[2])) pieces.push({ kind: "practice", id: m[2] });
    else if (m[1] === "program" && programById(m[2])) pieces.push({ kind: "program", id: m[2] });
    else if (m[1] === "selesai" && practiceById(m[2])) pieces.push({ kind: "action", action: "selesai", id: m[2] });
    else if (m[1] && m[1] !== "latihan" && m[1] !== "program" && m[1] !== "selesai" && programById(m[2])) pieces.push({ kind: "action", action: m[1] as Action, id: m[2] });
    else if (m[3] === "psikolog") pieces.push({ kind: "counsel" });
    else if (m[3] === "ajukan") pieces.push({ kind: "request" });
    else if (m[3] === "bantuan") pieces.push({ kind: "crisis" });
  }
  const rest = text.slice(last).trim();
  if (rest) pieces.push({ kind: "text", text: rest });
  // One card per recommendation, even if the model repeats a token.
  const seen = new Set<string>();
  return pieces.filter((p) => {
    if (p.kind === "text") return true;
    const key = p.kind === "practice" || p.kind === "program" ? `${p.kind}:${p.id}` : p.kind === "action" ? `${p.action}:${p.id}` : p.kind;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Words that show the crisis lines at once, before any answer arrives. */
const CRISIS = /bunuh diri|akhiri hidup|mengakhiri hidup|ingin mati|pengen mati|pingin mati|mau mati|tidak ingin hidup|gak mau hidup|nggak mau hidup|menyakiti diri|melukai diri|gantung diri|(loncat|lompat|terjun) dari|sayat|self.?harm|suicid/i;
export const isCrisis = (text: string) => CRISIS.test(text);
