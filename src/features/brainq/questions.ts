/* The BrainQ scan, word for word as on sikutaki-brainq.vercel.app/scan. Answers are 1–5. */

export type Question = { id: string; text: string; low: string; high: string };

export const ROLES = [
  { id: "personal", label: "Umum / staf" },
  { id: "executive", label: "Eksekutif / pemimpin" },
] as const;

export const DEMAND: Question = {
  id: "demand", text: "Seberapa berat tuntutan berpikir pekerjaan Anda saat ini?", low: "Ringan, rutin", high: "Sangat berat, kompleks",
};

const AGREE = { low: "Sangat tidak sesuai", high: "Sangat sesuai" };

export const SECTIONS: { title: string; sub: string; questions: Question[] }[] = [
  {
    title: "Fondasi otak", sub: "Tidur, gerak, energi, stres, dan pola makan.",
    questions: [
      { id: "q1", text: "Seberapa segar Anda bangun dalam 7 hari terakhir?", low: "Selalu lelah", high: "Selalu segar" },
      { id: "q2", text: "Berapa hari per minggu Anda aktif bergerak minimal 20–30 menit?", low: "0 hari", high: "6–7 hari" },
      { id: "q3", text: "Seberapa stabil energi Anda dari pagi hingga sore?", low: "Naik-turun drastis", high: "Stabil sepanjang hari" },
      { id: "q4", text: "Seberapa sering pikiran Anda terasa penuh atau tegang?", low: "Jarang", high: "Hampir setiap saat" },
      { id: "q5", text: "Seberapa konsisten pola makan Anda cukup protein, sayur/buah, dan tidak berlebihan makanan ultra-proses?", low: "Jarang konsisten", high: "Sangat konsisten" },
    ],
  },
  {
    title: "Performa kognitif", sub: "Seberapa sesuai pernyataan ini dengan Anda?",
    questions: [
      { id: "q6", text: "Fokus: saya mampu menyelesaikan pekerjaan tanpa mudah terdistraksi.", ...AGREE },
      { id: "q7", text: "Sustained attention: saya mampu mempertahankan konsentrasi cukup lama.", ...AGREE },
      { id: "q8", text: "Working memory: saya mampu menahan beberapa informasi sekaligus saat berpikir.", ...AGREE },
      { id: "q9", text: "Recall: saya mudah mengingat nama, percakapan, pekerjaan, atau informasi baru.", ...AGREE },
      { id: "q10", text: "Processing speed: saya merasa cepat memahami informasi baru.", ...AGREE },
      { id: "q11", text: "Mental clarity: pikiran saya terasa jernih, tidak mudah “brain fog”.", ...AGREE },
    ],
  },
  {
    title: "Cara berpikir", sub: "Seberapa sesuai pernyataan ini dengan Anda?",
    questions: [
      { id: "q12", text: "Critical thinking: saya terbiasa memeriksa bukti sebelum menerima informasi.", ...AGREE },
      { id: "q13", text: "Problem solving: saya mampu mencari beberapa alternatif solusi.", ...AGREE },
      { id: "q14", text: "Decision quality: keputusan saya relatif tenang, tidak terlalu impulsif.", ...AGREE },
      { id: "q15", text: "Creativity: saya mudah menghasilkan ide atau menghubungkan informasi dengan cara baru.", ...AGREE },
      { id: "q16", text: "Learning agility: saya relatif cepat mempelajari hal baru.", ...AGREE },
    ],
  },
  {
    title: "Mindset", sub: "Bagaimana Anda menghadapi gagal dan hal baru.",
    questions: [
      { id: "q17", text: "Ketika gagal, saya cenderung…", low: "Merasa kemampuan saya memang terbatas", high: "Mencari pelajaran dan mencoba lagi" },
      { id: "q18", text: "Seberapa sering Anda sengaja mempelajari hal baru?", low: "Hampir tidak pernah", high: "Setiap minggu" },
      { id: "q19", text: "Seberapa sering Anda melakukan sesuatu yang menantang otak, bukan kegiatan otomatis?", low: "Hampir tidak pernah", high: "Hampir setiap hari" },
    ],
  },
];

export const QUESTION_IDS = SECTIONS.flatMap((s) => s.questions.map((q) => q.id));

export const CONCERNS = [
  "mudah lupa", "sulit fokus", "brain fog", "lambat berpikir", "sulit belajar", "overthinking", "kurang kreatif", "kurang kritis",
  "keputusan buruk", "mindset negatif", "mudah terdistraksi", "kurang motivasi belajar", "mental fatigue", "lainnya",
];

/** Safety check. Answers stay in the browser: they are never sent to the server or shown to the company. */
export const RED_FLAGS = [
  "Perubahan daya ingat yang nyata atau cepat dalam beberapa minggu/bulan terakhir",
  "Pernah bingung waktu, tempat, atau tersesat di tempat yang biasa",
  "Gangguan bicara, kelemahan, atau gangguan gerak yang baru muncul",
  "Sakit kepala baru yang berat atau berbeda dari biasanya",
  "Kesulitan menjalankan aktivitas sehari-hari yang dulu biasa dilakukan",
];
