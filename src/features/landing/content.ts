import type { IconName } from "@/components/ui/Icon";

/* Landing page copy and sample data. Numbers inside the mock-ups are illustrative ("Data contoh"). */

export const AREA_GROUPS = [
  { id: "mood", name: "Suasana Hati", color: "#3D7FD9", areas: ["Sedih", "Galau", "Kecewa Berat", "Perasaan Hampa", "Depresi"] },
  { id: "mind", name: "Pikiran", color: "#7B61D1", areas: ["Tingkat Stres", "Anxiety", "Overthinking", "Panic Attack"] },
  { id: "energy", name: "Energi & Tidur", color: "#E39B3B", areas: ["Burnout", "Insomnia", "Baterai Sosial"] },
  { id: "self", name: "Diri & Hubungan", color: "#13906B", areas: ["Minder", "Trauma", "Dendam", "Mendam Marah", "Narsistik"] },
];

export const ALL_AREAS = AREA_GROUPS.flatMap((g) => g.areas.map((name) => ({ name, color: g.color })));

/** Heatmap sample, 0 = sehat to 100 = perlu perhatian. Deterministic so builds are stable. */
export const HEAT_TEAMS = ["Operasional", "Penjualan", "Teknologi", "Keuangan", "Layanan"];
export const HEAT: number[][] = HEAT_TEAMS.map((_, t) =>
  ALL_AREAS.map((_, a) => {
    const base = [38, 52, 44, 30, 58][t];
    const wave = Math.round(18 * Math.sin((a + 1) * (t + 2) * 0.9));
    const hot = (t === 1 && (a === 5 || a === 9)) || (t === 4 && (a === 9 || a === 10)) ? 28 : 0;
    return Math.max(8, Math.min(92, base + wave + hot));
  }),
);

export type TrendLine = { name: string; color: string; values: number[] };
export const TREND_WEEKS = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
export const TREND: TrendLine[] = [
  { name: "Tingkat Stres", color: "#7B61D1", values: [64, 66, 61, 63, 58, 57, 55, 56, 52, 50, 49, 47] },
  { name: "Burnout", color: "#E39B3B", values: [58, 60, 62, 59, 57, 54, 55, 51, 50, 48, 46, 45] },
  { name: "Insomnia", color: "#3D7FD9", values: [49, 47, 50, 48, 46, 47, 44, 43, 44, 41, 40, 38] },
];

export const TOP_AREAS: [string, number, string][] = [
  ["Burnout", 61, "#E39B3B"], ["Overthinking", 57, "#7B61D1"], ["Insomnia", 49, "#3D7FD9"], ["Minder", 41, "#13906B"],
];

export type WhyId = "anon" | "areas" | "psy" | "fast";
export const WHY: { id: WhyId; title: string; text: string }[] = [
  { id: "anon", title: "Anonim", text: "HR hanya melihat tren tim minimal 5 orang. Jawaban pribadi tetap milik karyawan." },
  { id: "areas", title: "17 area", text: "Bukan cuma stres. Tidur, minder, sampai marah yang dipendam ikut terpantau." },
  { id: "psy", title: "Psikolog", text: "Skor tinggi langsung diarahkan ke psikolog mitra secara rahasia." },
  { id: "fast", title: "Cepat", text: "Tanpa instal aplikasi. Check-in pertama terkirim di minggu yang sama." },
];

export const KNOW_POINTS = [
  "Check-in mingguan lewat ponsel, tanpa instal",
  "Hasil pribadi dalam bahasa sehari-hari",
  "Saran singkat yang bisa langsung dicoba",
  "Rujukan rahasia ke psikolog mitra",
  "Data tim untuk keputusan HR",
];

export const SOURCES = [
  { n: 1, text: "WHO, Mental health at work (fact sheet)", url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work" },
  { n: 2, text: "UGM, Indonesia National Adolescent Mental Health Survey (I-NAMHS)", url: "https://ugm.ac.id/en/news/23169-burden-of-adolescent-mental-disorders-in-indonesia-results-from-indonesia-s-first-national-mental-health-survey/" },
  { n: 3, text: "UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, Pasal 4 ayat (2)", url: "https://pasal.id/akn/id/act/uu/2022/27" },
];

export const STATS: { icon: IconName; value: string; text: string; source: number; halo: string }[] = [
  { icon: "people", value: "12 miliar", text: "hari kerja hilang setiap tahun karena depresi dan kecemasan", source: 1, halo: "bg-[radial-gradient(circle,#13906b_0_38%,#b9e4d2_39%_52%,#e3f4ec_53%_100%)]" },
  { icon: "trend", value: "US$1 triliun", text: "kerugian produktivitas global per tahun", source: 1, halo: "bg-[radial-gradient(circle,#7b61d1_0_38%,#d3c9f1_39%_52%,#efeafb_53%_100%)]" },
  { icon: "chat", value: "2,6%", text: "remaja Indonesia dengan masalah kesehatan mental yang mengakses layanan", source: 2, halo: "bg-[radial-gradient(circle,#f4a26b_0_38%,#f9d3b8_39%_52%,#fdeee3_53%_100%)]" },
];

export const DEMO_EMAIL = "halo@sikutaki.com";
