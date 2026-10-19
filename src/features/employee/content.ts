import type { IconName } from "@/components/ui/Icon";
import { MOODS as MOOD_LABELS } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";

/* Static content of the employee app. HR only ever sees group averages of 5 or more people. */

export type Mood = { id: number; label: string; bg: string; stroke: [string, string]; path: string };

/** Mood faces, from heaviest to best. Labels and colors match the mood chart on the HR dashboard. */
export const MOODS: Mood[] = [
  { bg: "#F3D3C8", stroke: ["#B5533C", "#D98A73"], path: "M14 36 C18 22, 38 22, 42 36" },
  { bg: "#F6DDD2", stroke: ["#D98A73", "#EDB9A6"], path: "M15 34 C21 26, 35 26, 41 34" },
  { bg: "#DEE5E2", stroke: ["#9AA8A3", "#C3CECA"], path: "M15 30 L41 30" },
  { bg: "#CFEADD", stroke: ["#5FAF8E", "#9AD2B8"], path: "M15 26 C21 34, 35 34, 41 26" },
  { bg: "#BFE3D1", stroke: ["#2E8A68", "#6BBF98"], path: "M14 23 C18 38, 38 38, 42 23" },
].map((m, i) => ({ ...m, id: i + 1, label: MOOD_LABELS[i] }) as Mood);

export const moodById = (id: number) => MOODS[id - 1];

/* ---------- Weekly check-in ---------- */

export const CHECKIN_QUESTIONS: Record<string, string> = {
  sedih: "Seberapa sering kamu merasa sedih yang dalam dan sulit hilang?",
  kecewa: "Seberapa sering kamu merasa sangat kecewa pada pekerjaan, orang lain, atau dirimu sendiri?",
  hampa: "Seberapa sering kamu merasa kosong atau kehilangan makna dalam pekerjaan?",
  moodswing: "Seberapa sering suasana hatimu berubah drastis dalam waktu singkat?",
  matirasa: "Seberapa sering kamu merasa mati rasa, tidak bisa merasakan senang maupun sedih?",
  duka: "Seberapa sering rasa duka karena kehilangan masih terasa berat untukmu?",
  apatis: "Seberapa sering kamu merasa tidak peduli lagi pada pekerjaan atau orang di sekitarmu?",
  stres: "Seminggu terakhir, seberapa sering kamu merasa tertekan oleh pekerjaan atau hal sehari-hari?",
  anxiety: "Seberapa sering kamu merasa cemas atau khawatir dan sulit menghentikannya?",
  overthinking: "Seberapa sering kamu memikirkan hal yang sama berulang-ulang sampai sulit beristirahat?",
  panik: "Seberapa sering kamu tiba-tiba merasa sangat takut, disertai jantung berdebar atau sesak?",
  galau: "Seberapa sering kamu merasa sangat gelisah sampai sulit tenang atau duduk diam?",
  disosiasi: "Seberapa sering kamu merasa tidak benar-benar hadir, seperti melihat dirimu dari kejauhan?",
  eksistensial: "Seberapa sering kamu mempertanyakan arti atau tujuan hidupmu sampai terasa berat?",
  burnout: "Seberapa sering kamu merasa lelah secara fisik dan emosional karena pekerjaan?",
  insomnia: "Seberapa sering kamu sulit tidur atau bangun tanpa merasa segar?",
  baterai: "Seberapa sering kamu merasa energimu habis setelah berinteraksi dengan orang lain?",
  minder: "Seberapa sering kamu merasa kurang percaya diri dibanding orang lain?",
  selfesteem: "Seberapa sering kamu merasa dirimu tidak berharga?",
  impostor: "Seberapa sering kamu merasa keberhasilanmu bukan karena kemampuanmu sendiri?",
  trauma: "Seberapa sering pengalaman berat di masa lalu masih mengganggumu?",
  dendam: "Seberapa sering kamu teringat sakit hati yang belum selesai?",
  marah: "Seberapa sering emosimu meledak, atau kamu memendam marah yang tidak tersalurkan?",
  sosial: "Seberapa sering kamu merasa takut atau sangat tidak nyaman saat berinteraksi dengan orang lain?",
  relasi: "Seberapa sering kamu khawatir akan ditinggalkan oleh orang terdekat?",
  pleaser: "Seberapa sering kamu sulit menolak permintaan orang lain walau merugikan dirimu?",
  cemburu: "Seberapa sering kamu merasa cemburu dan tidak aman dalam hubungan atau di tempat kerja?",
  perfeksionis: "Seberapa sering kamu sulit menyelesaikan pekerjaan karena merasa hasilnya belum sempurna?",
  fomo: "Seberapa sering kamu takut tertinggal dari pengalaman atau pencapaian orang lain?",
  gadget: "Seberapa sering penggunaan ponsel atau media sosial mengganggu tidur, kerja, atau hubunganmu?",
  prokrastinasi: "Seberapa sering kamu menunda pekerjaan penting walau tahu dampaknya?",
  makan: "Seberapa sering kamu makan berlebihan, atau justru tidak makan, karena emosi?",
  egois: "Seberapa sering kamu sulit melihat sudut pandang orang lain?",
  sombong: "Seberapa sering kamu sulit menerima masukan dari orang lain?",
  keras: "Seberapa sering kamu bertahan pada pendapatmu walau ada alasan kuat untuk berubah?",
  ambisius: "Seberapa sering dorongan untuk berprestasi membuatmu menekan diri sendiri atau orang lain?",
  depresi: "Seberapa sering kamu kehilangan minat pada hal yang biasanya kamu nikmati?",
  bipolar: "Seberapa sering kamu mengalami masa sangat bersemangat yang lalu berganti menjadi sangat terpuruk?",
  adhd: "Seberapa sering kamu sulit fokus, gelisah, atau bertindak tanpa berpikir panjang?",
  skizofrenia: "Seberapa sering kamu mendengar atau melihat sesuatu yang tampaknya tidak dialami orang lain?",
  narsistik: "Seberapa sering kamu merasa sangat butuh pujian atau pengakuan dari orang lain?",
  psikopat: "Seberapa sering kamu merasa tidak bersalah setelah tindakanmu menyakiti orang lain?",
};

export type Level = "lo" | "mid" | "hi";
export const level = (v: number): { label: string; tone: Level } =>
  v >= 3 ? { label: "Tinggi", tone: "hi" } : v === 2 ? { label: "Sedang", tone: "mid" } : { label: "Rendah", tone: "lo" };

/* ---------- Exercises ---------- */

export type Exercise = {
  id: string;
  title: string;
  minutes: string;
  feeling: string;
  steps: [label: string, seconds: number][];
  /** Three soft colors for the card artwork. */
  colors: [string, string, string];
};

export const EXERCISES: Exercise[] = [
  { id: "napas", title: "Napas 4-7-8", minutes: "3 menit", feeling: "Tenang", steps: [["Tarik napas", 4], ["Tahan", 7], ["Buang perlahan", 8]], colors: ["#E0F2F1", "#8FCFC4", "#E6F1E8"] },
  { id: "jeda", title: "Jeda Tenang", minutes: "5 menit", feeling: "Tenang", steps: [["Tarik napas", 4], ["Buang perlahan", 6]], colors: ["#E3F4EC", "#A9DCC5", "#F3EBD9"] },
  { id: "tidur", title: "Siap Tidur", minutes: "8 menit", feeling: "Bisa tidur", steps: [["Tarik napas", 4], ["Lemaskan bahu", 4], ["Buang perlahan", 8]], colors: ["#DDEDE7", "#6FB49A", "#CFE6DA"] },
  { id: "fokus", title: "Fokus Sebelum Kerja", minutes: "4 menit", feeling: "Fokus", steps: [["Tarik napas", 4], ["Tahan", 4], ["Buang", 4], ["Tahan", 4]], colors: ["#EAF5DF", "#B6D98F", "#E3F4EC"] },
  { id: "lepas", title: "Lepas Beban Pikiran", minutes: "6 menit", feeling: "Lega", steps: [["Tarik napas", 5], ["Buang dan lepaskan", 7]], colors: ["#F6EDE4", "#E7C2A5", "#E3F2EA"] },
];
export const FEELINGS = ["Semua", "Tenang", "Bisa tidur", "Fokus", "Lega"];
export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);

/** Exercises suggested from today's mood and sleep. */
export function suggestedExercises(mood: number | null, sleep: number) {
  if (mood && mood <= 2) return ["napas", "lepas"];
  if (sleep < 6.5) return ["tidur", "napas"];
  return ["fokus", "jeda"];
}

/* ---------- Navigation ---------- */

export const APP_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: ROUTES.employee.home, label: "Beranda", icon: "home" },
  { href: ROUTES.employee.exercises, label: "Latihan", icon: "lotus" },
  { href: ROUTES.employee.insight, label: "Insight", icon: "bars" },
  { href: ROUTES.employee.counseling, label: "Konseling", icon: "chat" },
];

/* Calm-down tool for moments of anxiety or panic. */

/** One breathing step: what to do, for how many seconds, and how big the circle should be at the end of it. */
export type CalmStep = [label: string, seconds: number, scale: number];
export type CalmPattern = { id: string; name: string; rhythm: string; text: string; steps: CalmStep[] };

export const CALM_PATTERNS: CalmPattern[] = [
  {
    id: "lega",
    name: "Napas lega",
    rhythm: "2 + 1 tarik, 6 buang",
    text: "Dua tarikan lewat hidung, satu buangan panjang lewat mulut.",
    steps: [["Tarik napas lewat hidung", 2, 0.86], ["Tarik sedikit lagi", 1, 1], ["Buang pelan lewat mulut", 6, 0.5]],
  },
  {
    id: "panjang",
    name: "Buang panjang",
    rhythm: "4 tarik, 6 buang",
    text: "Tanpa menahan napas, kalau menahan terasa sesak.",
    steps: [["Tarik napas", 4, 1], ["Buang perlahan", 6, 0.5]],
  },
  {
    id: "kotak",
    name: "Napas kotak",
    rhythm: "4 tarik, 4 tahan, 4 buang, 4 tahan",
    text: "Ritme rata yang mudah dihitung.",
    steps: [["Tarik napas", 4, 1], ["Tahan", 4, 1], ["Buang perlahan", 4, 0.5], ["Tahan", 4, 0.5]],
  },
];

/** 5-4-3-2-1 grounding: name things around you, one sense at a time. */
export const GROUNDING = [
  { count: 5, sense: "lihat", prompt: "Sebutkan 5 hal yang bisa kamu lihat", hint: "Warna dinding, layar, tanganmu sendiri." },
  { count: 4, sense: "sentuh", prompt: "Rasakan 4 hal yang bisa kamu sentuh", hint: "Kursi di bawahmu, kain baju, permukaan meja." },
  { count: 3, sense: "dengar", prompt: "Dengarkan 3 suara di sekitarmu", hint: "AC, langkah orang, napasmu sendiri." },
  { count: 2, sense: "cium", prompt: "Cari 2 bau yang bisa kamu cium", hint: "Kopi, sabun di tangan, udara ruangan." },
  { count: 1, sense: "rasa", prompt: "Perhatikan 1 rasa di mulutmu", hint: "Sisa minuman, atau minum seteguk air." },
];
