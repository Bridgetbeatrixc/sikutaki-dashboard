/*
 * Self-guided practices and programs of the employee app, shared by the server and the app.
 * Everything here is a practice for wellbeing, never a treatment: no word in it promises to heal.
 * Scripts are drafts until the partner psychologist has reviewed them.
 */

export type PracticeGroup = "singkat" | "napas" | "relaksasi" | "gerak" | "suara" | "tulis" | "hening" | "energi";
export type SoundId = "hujan" | "sungai" | "ombak" | "burung" | "mangkuk" | "gong";
export type JournalId = "syukur" | "refleksi" | "ekspresif";
export type GuidedStep = { text: string; seconds: number };

type Base = {
  id: string;
  title: string;
  minutes: number;
  group: PracticeGroup;
  blurb: string;
  /** Three soft colors for the card artwork. */
  colors: [string, string, string];
  /** Movement: show the "stop if dizzy or in pain" note first. */
  caution?: boolean;
};

export type BreathPractice = Base & { kind: "breath"; steps: [label: string, seconds: number][] };
export type GuidedPractice = Base & { kind: "guided"; steps: GuidedStep[] };
export type SoundPractice = Base & { kind: "sound"; sound: SoundId };
export type JournalPractice = Base & { kind: "journal"; journal: JournalId };
export type SilencePractice = Base & { kind: "silence" };
export type Practice = BreathPractice | GuidedPractice | SoundPractice | JournalPractice | SilencePractice;

export const GROUPS: { id: PracticeGroup; title: string; sub: string }[] = [
  { id: "singkat", title: "Latihan singkat", sub: "1 sampai 3 menit, bisa di sela kerja" },
  { id: "napas", title: "Napas", sub: "Napas terpandu dengan lingkaran" },
  { id: "relaksasi", title: "Relaksasi tubuh", sub: "Melemaskan otot dan memperhatikan tubuh" },
  { id: "gerak", title: "Gerak ringan", sub: "Bisa sambil duduk atau berdiri di tempat" },
  { id: "suara", title: "Suara alam", sub: "Putar sambil bekerja atau menjelang tidur" },
  { id: "tulis", title: "Tulis dan refleksi", sub: "Tersimpan hanya di perangkatmu" },
  { id: "hening", title: "Jeda hening", sub: "Waktu tenang untuk berdoa sesuai keyakinanmu" },
  { id: "energi", title: "Latihan Energi", sub: "Praktik tradisional untuk relaksasi" },
];

export const MOVEMENT_NOTE = "Berhenti bila pusing, sesak, atau nyeri. Ibu hamil serta penderita penyakit jantung atau tekanan darah tinggi sebaiknya bertanya ke dokter sebelum latihan gerak.";
export const ENERGY_NOTE = "Praktik tradisional untuk relaksasi, bukan pengganti perawatan medis atau psikologis.";

const s = (text: string, seconds: number): GuidedStep => ({ text, seconds });

export const PRACTICES: Practice[] = [
  /* Short */
  {
    id: "leher", kind: "guided", group: "singkat", title: "Lemaskan Leher dan Bahu", minutes: 2, caution: true,
    blurb: "Untuk bahu yang tegang setelah lama di depan layar.", colors: ["#E8F1FB", "#A9C6EC", "#EEF4E4"],
    steps: [
      s("Duduk tegak, kaki menapak lantai. Letakkan kedua tangan di paha.", 15),
      s("Turunkan telinga kanan perlahan ke arah bahu kanan. Tahan sambil bernapas biasa.", 20),
      s("Kembali ke tengah, lalu turunkan telinga kiri ke arah bahu kiri. Tahan.", 20),
      s("Angkat kedua bahu ke arah telinga, lalu jatuhkan perlahan. Ulangi beberapa kali.", 25),
      s("Putar kedua bahu ke belakang perlahan, lima kali.", 20),
      s("Diam sejenak. Perhatikan bagian yang sekarang terasa lebih ringan.", 15),
    ],
  },
  {
    id: "mata", kind: "guided", group: "singkat", title: "Istirahatkan Mata", minutes: 1,
    blurb: "Jeda satu menit untuk mata yang lelah menatap layar.", colors: ["#E6F3F1", "#9FD3C8", "#F2EEDD"],
    steps: [
      s("Alihkan pandangan dari layar ke benda yang jauh, misalnya jendela atau ujung ruangan.", 20),
      s("Kedipkan mata pelan beberapa kali.", 10),
      s("Gosok kedua telapak tangan sampai hangat, lalu tutup mata dengan telapak tangan tanpa menekan.", 20),
      s("Buka mata perlahan dan kembali bekerja.", 10),
    ],
  },
  {
    id: "hadir", kind: "guided", group: "singkat", title: "Satu Menit Hadir", minutes: 1,
    blurb: "Kembali ke saat ini sebelum rapat atau tugas berikutnya.", colors: ["#EEF0FA", "#B9C2E8", "#E9F4EE"],
    steps: [
      s("Rasakan kedua kaki menapak lantai dan berat tubuh di kursi.", 15),
      s("Perhatikan tiga suara di sekitarmu, tanpa menilainya.", 15),
      s("Ambil tiga napas pelan. Buang napas sedikit lebih panjang dari tarikan.", 20),
      s("Pilih satu hal yang akan kamu kerjakan setelah ini.", 10),
    ],
  },

  /* Breathing */
  { id: "lega", kind: "breath", group: "napas", title: "Napas Lega", minutes: 5, blurb: "Dua tarikan pendek, satu buangan panjang.", colors: ["#E3EEFB", "#9DBDEB", "#E6F1E8"], steps: [["Tarik napas lewat hidung", 2], ["Tarik sedikit lagi", 1], ["Buang pelan lewat mulut", 6]] },
  { id: "napas", kind: "breath", group: "napas", title: "Napas 4-7-8", minutes: 3, blurb: "Ritme pelan untuk menenangkan diri.", colors: ["#E0F2F1", "#8FCFC4", "#E6F1E8"], steps: [["Tarik napas", 4], ["Tahan", 7], ["Buang perlahan", 8]] },
  { id: "jeda", kind: "breath", group: "napas", title: "Jeda Tenang", minutes: 5, blurb: "Buang napas lebih panjang dari tarikan.", colors: ["#E3F4EC", "#A9DCC5", "#F3EBD9"], steps: [["Tarik napas", 4], ["Buang perlahan", 6]] },
  { id: "tidur", kind: "breath", group: "napas", title: "Siap Tidur", minutes: 8, blurb: "Melambat sebelum tidur.", colors: ["#DDEDE7", "#6FB49A", "#CFE6DA"], steps: [["Tarik napas", 4], ["Lemaskan bahu", 4], ["Buang perlahan", 8]] },
  { id: "fokus", kind: "breath", group: "napas", title: "Fokus Sebelum Kerja", minutes: 4, blurb: "Napas kotak untuk memulai hari.", colors: ["#EAF5DF", "#B6D98F", "#E3F4EC"], steps: [["Tarik napas", 4], ["Tahan", 4], ["Buang", 4], ["Tahan", 4]] },
  { id: "lepas", kind: "breath", group: "napas", title: "Lepas Beban Pikiran", minutes: 6, blurb: "Saat pikiran terasa penuh.", colors: ["#F6EDE4", "#E7C2A5", "#E3F2EA"], steps: [["Tarik napas", 5], ["Buang dan lepaskan", 7]] },

  /* Body relaxation */
  {
    id: "otot", kind: "guided", group: "relaksasi", title: "Relaksasi Otot Progresif", minutes: 5, caution: true,
    blurb: "Kencangkan lalu lemaskan otot satu per satu.", colors: ["#F1ECF8", "#C9B6E4", "#E8F3EE"],
    steps: [
      s("Duduk atau berbaring dengan nyaman. Kencangkan otot hanya sampai terasa, jangan sampai sakit.", 20),
      s("Kepalkan kedua tangan kuat-kuat. Tahan.", 6), s("Lepaskan. Rasakan bedanya antara tegang dan lemas.", 15),
      s("Tekuk siku dan kencangkan lengan atas. Tahan.", 6), s("Lepaskan. Biarkan lengan jatuh lemas.", 15),
      s("Angkat bahu ke arah telinga. Tahan.", 6), s("Lepaskan. Rasakan bahu turun.", 15),
      s("Kerutkan wajah: pejamkan mata kuat dan rapatkan bibir. Tahan.", 6), s("Lepaskan. Biarkan wajah lembut.", 15),
      s("Kencangkan perut. Tahan.", 6), s("Lepaskan. Bernapas biasa.", 15),
      s("Luruskan kaki dan tarik ujung jari kaki ke arah tubuh. Tahan.", 6), s("Lepaskan. Rasakan kaki menjadi berat dan hangat.", 15),
      s("Diam sejenak. Perhatikan seluruh tubuh yang lebih lemas.", 30),
    ],
  },
  {
    id: "pindai", kind: "guided", group: "relaksasi", title: "Body Scan", minutes: 8,
    blurb: "Memperhatikan tubuh dari kepala sampai kaki.", colors: ["#E7EEF8", "#A8BDDF", "#EFEAF6"],
    steps: [
      s("Berbaring atau duduk dengan nyaman. Pejamkan mata bila nyaman, atau tatap satu titik di bawah.", 30),
      s("Perhatikan napasmu keluar dan masuk tanpa mengubahnya.", 40),
      s("Arahkan perhatian ke kepala dan wajah. Lemaskan dahi, rahang, dan lidah.", 50),
      s("Turun ke leher dan bahu. Bila ada rasa tegang, cukup perhatikan.", 50),
      s("Rasakan kedua lengan sampai ujung jari.", 50),
      s("Perhatikan dada dan perut yang naik turun mengikuti napas.", 50),
      s("Turun ke punggung dan pinggang.", 50),
      s("Rasakan kedua kaki, dari paha sampai telapak kaki.", 60),
      s("Rasakan seluruh tubuh sekaligus. Bila pikiran melayang, kembalikan perhatian ke napas.", 60),
      s("Gerakkan jari tangan dan kaki perlahan, lalu buka mata.", 30),
    ],
  },

  /* Light movement */
  {
    id: "meja", kind: "guided", group: "gerak", title: "Peregangan di Meja Kerja", minutes: 5, caution: true,
    blurb: "Peregangan pagi atau di sela kerja, tanpa perlu berdiri.", colors: ["#EAF4FB", "#9CCBEA", "#F1F0DE"],
    steps: [
      s("Duduk di tepi kursi, punggung tegak, kaki menapak lantai.", 20),
      s("Jalin jari kedua tangan, dorong telapak ke atas kepala. Tahan sambil bernapas.", 30),
      s("Tangan tetap di atas, condongkan badan perlahan ke kanan, lalu ke kiri.", 40),
      s("Letakkan tangan kanan di sandaran kursi, putar badan ke kanan perlahan. Ganti sisi.", 40),
      s("Luruskan satu kaki ke depan, tarik ujung jari kaki ke arah tubuh. Ganti kaki.", 40),
      s("Putar pergelangan tangan dan kaki perlahan.", 40),
      s("Tarik napas dalam, angkat bahu, lalu lepaskan sambil buang napas. Ulangi tiga kali.", 40),
      s("Duduk diam sejenak sebelum kembali bekerja.", 20),
    ],
  },
  {
    id: "jalan", kind: "guided", group: "gerak", title: "Jalan Kaki 5 Menit", minutes: 5, caution: true,
    blurb: "Jalan pelan sambil memperhatikan langkah.", colors: ["#EDF6E6", "#B5D99A", "#E6F0F7"],
    steps: [
      s("Mulailah berjalan dengan langkah biasa, di dalam ruangan atau di luar.", 40),
      s("Perhatikan telapak kaki yang menyentuh lantai, tumit lalu ujung jari.", 60),
      s("Biarkan kedua lengan berayun lemas.", 50),
      s("Perhatikan hal di sekitarmu: warna, cahaya, suara.", 60),
      s("Samakan napas dengan langkah, misalnya tiga langkah tarik, tiga langkah buang.", 60),
      s("Pelankan langkah, lalu berhenti. Berdiri diam sejenak.", 30),
    ],
  },
  {
    id: "chikung", kind: "guided", group: "gerak", title: "Gerak Chikung Ringan", minutes: 6, caution: true,
    blurb: "Gerakan pelan yang selaras dengan napas.", colors: ["#F4EEE2", "#DCC39A", "#E5F1EA"],
    steps: [
      s("Berdiri dengan kaki selebar bahu, lutut sedikit ditekuk, bahu lemas.", 30),
      s("Tarik napas sambil mengangkat kedua tangan perlahan setinggi dada. Buang napas sambil menurunkannya. Ulangi.", 60),
      s("Jalin jari, dorong telapak tangan ke atas sambil tarik napas. Turunkan tangan ke samping sambil buang napas.", 60),
      s("Putar pinggang pelan ke kanan dan kiri. Biarkan lengan mengayun lemas mengikuti.", 60),
      s("Tepuk-tepuk ringan lengan, bahu, dan kaki dari atas ke bawah.", 50),
      s("Berdiri diam dengan tangan di perut. Bernapas pelan.", 60),
    ],
  },
  {
    id: "jinjit", kind: "guided", group: "gerak", title: "Senam Jinjit", minutes: 3, caution: true,
    blurb: "Naik ke ujung jari kaki, turun perlahan. Pegang kursi agar seimbang.", colors: ["#EAF2FA", "#A7C3E3", "#F3EEDF"],
    steps: [
      s("Berdiri di belakang kursi dan pegang sandarannya. Kaki selebar pinggul.", 20),
      s("Naik perlahan ke ujung jari kaki, tahan sebentar, lalu turunkan tumit pelan-pelan. Ulangi 10 kali.", 50),
      s("Istirahat. Goyangkan kaki pelan.", 20),
      s("Ulangi naik dan turun 10 kali lagi, tetap berpegangan.", 50),
      s("Istirahat dan bernapas biasa.", 20),
      s("Ulangi sekali lagi bila masih nyaman. Lewati bila betis terasa nyeri.", 30),
    ],
  },

  /* Nature sounds, generated in the browser */
  { id: "hujan", kind: "sound", sound: "hujan", group: "suara", title: "Hujan", minutes: 10, blurb: "Suara hujan yang rata.", colors: ["#E5ECF5", "#9FB3CF", "#DDE7F0"] },
  { id: "sungai", kind: "sound", sound: "sungai", group: "suara", title: "Aliran Sungai", minutes: 10, blurb: "Air mengalir pelan.", colors: ["#E1F1F2", "#8CC9CC", "#E6F2EA"] },
  { id: "ombak", kind: "sound", sound: "ombak", group: "suara", title: "Ombak", minutes: 10, blurb: "Ombak datang dan pergi.", colors: ["#E2EDF8", "#8FB4DD", "#EAF1F6"] },
  { id: "burung", kind: "sound", sound: "burung", group: "suara", title: "Kicau Burung", minutes: 10, blurb: "Pagi di taman.", colors: ["#EDF5E3", "#B8D896", "#F4F0DF"] },

  /* Writing */
  { id: "syukur", kind: "journal", journal: "syukur", group: "tulis", title: "Tiga Hal Baik", minutes: 3, blurb: "Tulis tiga hal baik hari ini dan apa peranmu di dalamnya.", colors: ["#FBF1E2", "#EBC88E", "#EEF4E4"] },
  { id: "refleksi", kind: "journal", journal: "refleksi", group: "tulis", title: "Refleksi Makna", minutes: 5, blurb: "Apa yang paling penting bagimu minggu ini.", colors: ["#F0EEF8", "#BDB4E0", "#F3EFE4"] },
  { id: "ekspresif", kind: "journal", journal: "ekspresif", group: "tulis", title: "Menulis Ekspresif", minutes: 10, blurb: "Tuliskan pikiran dan perasaan tentang hal yang berat.", colors: ["#F6ECEA", "#DDAFA6", "#EEF1F6"] },

  /* Quiet */
  { id: "hening", kind: "silence", group: "hening", title: "Jeda Hening untuk Berdoa", minutes: 5, blurb: "Pengatur waktu dan suasana tenang, tanpa teks doa.", colors: ["#EEF0F4", "#B7BFCC", "#F2EFE7"] },

  /* Energy practices: shown only when the company allows them and the employee turns them on */
  { id: "mangkuk", kind: "sound", sound: "mangkuk", group: "energi", title: "Suara Mangkuk Bernyanyi", minutes: 5, blurb: "Dengung mangkuk logam yang memudar perlahan.", colors: ["#F6EFE0", "#DCC28E", "#EDE9F5"] },
  { id: "gong", kind: "sound", sound: "gong", group: "energi", title: "Suara Gong", minutes: 5, blurb: "Getaran gong yang dalam dan panjang.", colors: ["#F2EAE0", "#C9A97F", "#EAEFF5"] },
  {
    id: "rasa-energi", kind: "guided", group: "energi", title: "Merasakan Energi Tubuh", minutes: 5,
    blurb: "Memperhatikan rasa hangat dan getaran halus di tubuh.", colors: ["#F7EEE6", "#E4BC9C", "#EAF0F7"],
    steps: [
      s("Duduk tegak dan nyaman. Ambil beberapa napas pelan.", 30),
      s("Gosok kedua telapak tangan selama beberapa detik sampai terasa hangat.", 20),
      s("Jauhkan kedua telapak tangan sekitar satu jengkal. Perhatikan rasa hangat atau getaran halus di antaranya.", 50),
      s("Dekatkan dan jauhkan kedua tangan perlahan. Cukup perhatikan apa pun yang terasa.", 50),
      s("Letakkan tangan di perut. Rasakan perut naik turun mengikuti napas.", 60),
      s("Arahkan perhatian ke seluruh tubuh. Perhatikan bagian yang terasa hangat, ringan, atau berat.", 60),
      s("Kembali ke napas, lalu buka mata perlahan.", 30),
    ],
  },
  {
    id: "prana", kind: "guided", group: "energi", title: "Latihan Prana Mandiri", minutes: 6,
    blurb: "Napas pelan dengan bayangan udara segar memenuhi tubuh.", colors: ["#EAF3EE", "#A4CFB6", "#F5EFE2"],
    steps: [
      s("Duduk tegak dengan telapak tangan menghadap ke atas di pangkuan.", 30),
      s("Tarik napas pelan lewat hidung. Bayangkan udara segar masuk dan memenuhi dada.", 50),
      s("Buang napas perlahan. Bayangkan rasa lelah dan tegang ikut keluar.", 50),
      s("Lanjutkan. Saat menarik napas, bayangkan cahaya yang lembut mengalir dari kepala sampai kaki.", 70),
      s("Saat membuang napas, biarkan bahu, rahang, dan perut melemas.", 70),
      s("Lepaskan bayangan itu dan bernapas biasa. Perhatikan rasa tubuhmu sekarang.", 50),
    ],
  },
];

export const practiceById = (id: string) => PRACTICES.find((p) => p.id === id);
export const PRACTICE_IDS = PRACTICES.map((p) => p.id);
export const breathPractices = PRACTICES.filter((p): p is BreathPractice => p.kind === "breath");

/** Exercises suggested from today's mood and sleep. */
export function suggestedPractices(mood: number | null, sleep: number): string[] {
  if (mood && mood <= 2) return ["lega", "lepas"];
  if (sleep < 6.5) return ["tidur", "pindai"];
  return ["fokus", "meja"];
}

/* ---------- Writing prompts ---------- */

export const JOURNAL: Record<JournalId, { intro: string; fields: string[] }> = {
  syukur: {
    intro: "Tulis tiga hal baik yang terjadi hari ini, sekecil apa pun, dan apa peranmu di dalamnya.",
    fields: ["Hal baik pertama", "Hal baik kedua", "Hal baik ketiga"],
  },
  refleksi: {
    intro: "Tidak ada jawaban benar atau salah. Tulis seadanya.",
    fields: ["Apa yang paling penting bagiku minggu ini?", "Kapan minggu ini aku merasa paling menjadi diriku sendiri?", "Satu langkah kecil apa yang bisa kulakukan untuk hal yang penting itu?"],
  },
  ekspresif: {
    intro: "Tulis pikiran dan perasaanmu yang terdalam tentang hal yang sedang berat, selama sekitar 10 menit. Jangan pikirkan ejaan atau susunan kalimat. Bila terasa terlalu berat, berhenti kapan saja.",
    fields: ["Tulisanmu"],
  },
};

/* ---------- Programs ---------- */

export type ProgramKind = "praktis" | "rutin";
export type Slot = "pagi" | "malam" | "harian";
export const SLOT_LABEL: Record<Slot, string> = { pagi: "Pagi", malam: "Malam", harian: "Hari ini" };

export type Program = {
  id: string;
  title: string;
  kind: ProgramKind;
  days: number;
  slots: Slot[];
  blurb: string;
  /** Practice for a 0-based program day and slot. */
  session: (day: number, slot: Slot) => string;
};

export const PROGRAMS: Program[] = [
  {
    id: "tidur-7", title: "7 Hari Tidur Lebih Nyenyak", kind: "praktis", days: 7, slots: ["pagi", "malam"],
    blurb: "Peregangan setiap pagi dan latihan menjelang tidur setiap malam, 5 sampai 10 menit.",
    session: (d, slot) => (slot === "pagi" ? "meja" : d < 3 ? "tidur" : "pindai"),
  },
  {
    id: "stres-7", title: "7 Hari Lepas Stres", kind: "praktis", days: 7, slots: ["pagi", "malam"],
    blurb: "Napas lega setiap pagi, relaksasi otot atau tiga hal baik setiap malam.",
    session: (d, slot) => (slot === "pagi" ? "lega" : d % 2 === 0 ? "otot" : "syukur"),
  },
  {
    id: "tidur-12", title: "12 Minggu Tidur Teratur", kind: "rutin", days: 84, slots: ["harian"],
    blurb: "Satu latihan menjelang tidur setiap hari, makin panjang dari minggu ke minggu.",
    session: (d) => (d < 14 ? "tidur" : d < 42 ? "pindai" : d % 2 === 0 ? "pindai" : "hujan"),
  },
  {
    id: "gerak-8", title: "8 Minggu Gerak Ringan", kind: "rutin", days: 56, slots: ["harian"],
    blurb: "Peregangan, chikung, dan senam jinjit, dimulai dari 5 menit sehari.",
    session: (d) => (d < 14 ? (d % 2 === 0 ? "meja" : "leher") : d < 35 ? (d % 2 === 0 ? "chikung" : "jinjit") : (d % 2 === 0 ? "chikung" : "jalan")),
  },
  {
    id: "syukur-4", title: "4 Minggu Syukur dan Refleksi", kind: "rutin", days: 28, slots: ["harian"],
    blurb: "Tiga hal baik dan refleksi makna bergantian, dengan menulis ekspresif sekali seminggu.",
    session: (d) => (d % 7 === 6 ? "ekspresif" : d % 2 === 0 ? "syukur" : "refleksi"),
  },
];

export const programById = (id: string) => PROGRAMS.find((p) => p.id === id);

export type Enrollment = { id: string; program: string; startedOn: string; paused: boolean; sessions: { day: string; slot: Slot }[] };

/**
 * Where an enrollment stands today. A program moves forward one day for every day with at least one session,
 * so a missed day never sends it back to the start.
 */
export function programState(e: Enrollment, today: string, mood: number | null) {
  const p = programById(e.program)!;
  const before = new Set(e.sessions.filter((x) => x.day < today).map((x) => x.day));
  const day = Math.min(before.size, p.days - 1);
  const doneToday = e.sessions.filter((x) => x.day === today).map((x) => x.slot);
  const slots = p.slots.map((slot) => {
    let practice = p.session(day, slot);
    // Gratitude is never pushed on a heavy day: a breathing practice takes its place.
    if (practice === "syukur" && mood === 1) practice = "lepas";
    return { slot, practice, done: doneToday.includes(slot) };
  });
  const daysDone = before.size + (doneToday.length ? 1 : 0);
  const allDoneToday = slots.every((x) => x.done);
  // Done once the last day is complete, or once every day had a session even if a slot of the last day was skipped.
  const finished = (daysDone >= p.days && allDoneToday) || before.size >= p.days;
  return { program: p, day, week: Math.floor(day / 7), daysDone, slots, finished, allDoneToday };
}

export const progressLabel = (p: Program, day: number) =>
  p.kind === "praktis" ? `Hari ${day + 1} dari ${p.days}` : `Minggu ${Math.floor(day / 7) + 1} dari ${p.days / 7}`;

/* ---------- Suggestions ---------- */

/** What to suggest after a check-in, by the area with the highest score. */
export const AREA_SUGGESTION: Record<string, { program?: string; counsel?: boolean; calm?: boolean }> = {
  insomnia: { program: "tidur-7" },
  burnout: { program: "stres-7" },
  stres: { program: "stres-7" },
  galau: { calm: true, counsel: true },
  eksistensial: { program: "syukur-4", counsel: true },
  baterai: { program: "gerak-8" },
};

/** The mapped area with the highest answer, from "Sedang" (2) up. */
export function suggestionFromCheckin(answers: Record<string, number> | null) {
  if (!answers) return null;
  let best: string | null = null;
  for (const area of Object.keys(AREA_SUGGESTION)) {
    const v = answers[area];
    if (v === undefined || v < 2) continue;
    if (!best || v > answers[best]) best = area;
  }
  return best ? { area: best, ...AREA_SUGGESTION[best] } : null;
}

/** Mood "Kurang" or lower on each of the last three days. */
export function lowMoodStreak(days: { day: string; mood: number }[], dates: string[]) {
  return dates.every((d) => (days.find((x) => x.day === d)?.mood ?? 5) <= 2);
}

/* ---------- Complementary practitioners ---------- */

export const PRACTITIONER_TYPES = [
  { id: "napas", label: "Instruktur pernapasan dan meditasi", requirement: "Sertifikat pelatihan dari lembaga yang dapat diperiksa" },
  { id: "chikung", label: "Instruktur chikung dan senam", requirement: "Sertifikat instruktur" },
  { id: "energi", label: "Praktisi energi, prana, dan suara getaran", requirement: "Terdaftar sebagai penyehat tradisional sesuai UU 17/2023 dan PP 28/2024" },
  { id: "rohani", label: "Pembimbing rohani", requirement: "Ditunjuk perusahaan atau lembaga keagamaan" },
] as const;
export type PractitionerType = (typeof PRACTITIONER_TYPES)[number]["id"];
export const practitionerType = (id: string) => PRACTITIONER_TYPES.find((t) => t.id === id);

export const PRACTITIONER_CODE = [
  "Tidak mendiagnosis penyakit",
  "Tidak menyarankan berhenti dari perawatan medis atau psikologis yang sedang dijalani",
  "Tidak menawarkan atau menjual produk",
  "Merujuk ke psikolog atau dokter bila ada tanda bahaya",
];

export const REPORT_REASONS = [
  "Menyarankan berhenti dari perawatan medis",
  "Mendiagnosis penyakit",
  "Menawarkan atau menjual produk",
  "Lainnya",
];

/* ---------- Danger signs ---------- */

/** Areas where "Sering" or more calls for a psychologist before any self-guided practice. */
const DANGER_AREAS = ["depresi", "skizofrenia", "bipolar", "panik", "galau", "trauma", "selfesteem"];

export const dangerSigns = (answers: Record<string, number> | null) =>
  Boolean(answers) && DANGER_AREAS.some((a) => (answers![a] ?? 0) >= 3);
