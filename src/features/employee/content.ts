import type { IconName } from "@/components/ui/Icon";
import { ROTATION } from "@/lib/data";
import { MOODS as MOOD_LABELS } from "@/lib/focus";
import { ROUTES } from "@/lib/paths";

/* Static content of the employee app. Everything an employee enters stays on their side;
   HR only ever sees group averages of 5 or more people. */

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
  stres: "Seminggu terakhir, seberapa sering kamu merasa tertekan oleh pekerjaan atau hal sehari-hari?",
  burnout: "Seberapa sering kamu merasa lelah secara fisik dan emosional karena pekerjaan?",
  insomnia: "Seberapa sering kamu sulit tidur atau bangun tanpa merasa segar?",
  hampa: "Seberapa sering kamu merasa kosong atau kehilangan makna dalam pekerjaan?",
  depresi: "Seberapa sering kamu kehilangan minat pada hal yang biasanya kamu nikmati?",
  anxiety: "Seberapa sering kamu merasa cemas atau khawatir dan sulit menghentikannya?",
};
export const SCALE = ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Hampir selalu"];
/** 3 core areas every week plus this week's rotating 3. */
export const CHECKIN_AREAS = ["stres", "burnout", "insomnia", ...ROTATION[1]];
/** Causes offered in the follow-up question (shown when burnout is "Kadang-kadang" or higher). */
export const FOLLOW_UP_CAUSES = ["shift", "pelanggan", "after", "volume", "recovery", "pribadi"];
export const needsFollowUp = (answers: Record<string, number>) => (answers.burnout ?? 0) >= 2;

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

/* ---------- Insight ---------- */

/** Earlier days of this week (sample data). Today comes from what the employee notes on Beranda. */
export const PAST_DAYS = [
  { day: "Rab", sleep: 6, mood: 3 }, { day: "Kam", sleep: 5.5, mood: 2 }, { day: "Jum", sleep: 5, mood: 2 },
  { day: "Sab", sleep: 7.5, mood: 4 }, { day: "Min", sleep: 8, mood: 4 }, { day: "Sen", sleep: 6.5, mood: 3 },
];
export const TODAY = { day: "Sel", long: "Selasa, 13 Oktober" };

/* ---------- Counseling ---------- */

export const SLOTS = ["Rab, 14 Okt · 19.00", "Kam, 15 Okt · 18.30", "Sab, 17 Okt · 10.00"];

/* ---------- Navigation ---------- */

export const APP_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: ROUTES.employee.home, label: "Beranda", icon: "home" },
  { href: ROUTES.employee.exercises, label: "Latihan", icon: "lotus" },
  { href: ROUTES.employee.insight, label: "Insight", icon: "bars" },
  { href: ROUTES.employee.counseling, label: "Konseling", icon: "chat" },
];

/** The flow guide shown next to the phone. */
export const FLOW = [
  { href: ROUTES.employee.root, title: "Kenalan", text: "Janji privasi dan cara kerja, sekali di awal." },
  { href: ROUTES.employee.home, title: "Catat mood harian", text: "Pilih mood dan jam tidur. 10 detik setiap hari." },
  { href: ROUTES.employee.checkin, title: "Check-in mingguan", text: "6 pertanyaan, 3 menit. Tutup setiap Minggu." },
  { href: ROUTES.employee.insight, title: "Lihat insight-mu", text: "Tidur vs mood, dan hasil check-in. Hanya untukmu." },
  { href: ROUTES.employee.exercises, title: "Latihan singkat", text: "Napas dan relaksasi dengan panduan, 3 sampai 8 menit." },
  { href: ROUTES.employee.calm, title: "Saat cemas atau panik", text: "Napas terpandu, grounding 5-4-3-2-1, dan jalur bantuan." },
  { href: ROUTES.employee.counseling, title: "Konseling bila perlu", text: "Pesan sesi psikolog secara rahasia." },
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
