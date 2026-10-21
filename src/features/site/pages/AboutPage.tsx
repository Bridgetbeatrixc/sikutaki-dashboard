/* eslint-disable @next/next/no-img-element */
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { Band, BandHead, CtaBand, FeatureCard, GradientIcon, PageHero } from "../ui";

/** Product facts that are true for the prototype today. */
const FACTS = [
  { value: "42", unit: "area", text: "kesehatan mental yang dipantau, bukan cuma stres" },
  { value: "3", unit: "menit", text: "untuk check-in mingguan di ponsel" },
  { value: "5", unit: "orang", text: "minimal per tim sebelum HR melihat rata-rata" },
];

/** Workplace moments for the mosaic. The first one is the large tile. */
const MOMENTS = [
  { src: "/img/tentang/ritme.jpg", alt: "Tim berdiskusi di depan papan berisi catatan tempel", label: "Ritme tim", tile: "col-span-2 row-span-2" },
  { src: "/img/tentang/bersama.jpg", alt: "Tim yang beragam berkumpul di depan laptop", label: "Melihat hasil bersama", tile: "col-span-2" },
  { src: "/img/tentang/rayakan.jpg", alt: "Dua rekan kerja tos di meja kerja", label: "Merayakan kemajuan", tile: "" },
  { src: "/img/tentang/obrolan.jpg", alt: "Obrolan santai di ruang kantor", label: "Ruang untuk bicara", tile: "" },
];

type Step = { who: string; icon: IconName; title: string; text: string };
const RHYTHM: Step[] = [
  { who: "Karyawan", icon: "phone", title: "Check-in 3 menit", text: "Setiap minggu karyawan menjawab beberapa pertanyaan singkat di ponsel. Jawabannya milik mereka sendiri." },
  { who: "HR", icon: "bars", title: "Melihat rata-rata tim", text: "HR melihat kondisi per divisi, hanya untuk tim dengan minimal 5 orang. Tidak ada jawaban per nama." },
  { who: "HR & pimpinan tim", icon: "file", title: "Bertindak dan mencatat", text: "HR dan lead memilih langkah kecil, lalu menyimpannya sebagai catatan tindakan agar dampaknya terlihat minggu berikutnya." },
  { who: "Karyawan", icon: "heart", title: "Didukung secara pribadi", text: "Karyawan mendapat latihan mandiri sesuai hasilnya dan bisa menghubungi psikolog mitra secara rahasia." },
];

type Role = { icon: IconName; title: string; gets: string[]; never: string };
const ROLES: Role[] = [
  {
    icon: "user", title: "Untuk karyawan",
    gets: ["Check-in mingguan 3 menit di ponsel", "Hasil pribadi dan perubahan dari minggu ke minggu", "Latihan mandiri singkat yang sesuai hasilnya", "Akses rahasia ke psikolog mitra"],
    never: "Jawaban pribadi tidak pernah ditampilkan ke perusahaan.",
  },
  {
    icon: "grid", title: "Untuk HR",
    gets: ["Dashboard rata-rata per divisi, min. 5 orang", "Area yang perlu perhatian minggu ini", "Catatan tindakan dan dampaknya dari waktu ke waktu", "Daftar psikolog dan praktisi mitra yang dikelola sendiri"],
    never: "HR tidak bisa melihat siapa menjawab apa.",
  },
  {
    icon: "people", title: "Untuk pimpinan tim",
    gets: ["Gambaran kondisi divisinya dari HR, sebagai rata-rata", "Saran langkah kecil yang bisa dicoba minggu ini", "Tindak lanjut yang dicatat bersama HR"],
    never: "Lead melihat tim, bukan orang per orang.",
  },
  {
    icon: "chat", title: "Untuk psikolog & praktisi mitra",
    gets: ["Ditampilkan di aplikasi karyawan setelah HR memeriksa kredensial", "Dihubungi langsung oleh karyawan yang memilihnya", "Kode etik yang jelas dan disetujui bersama"],
    never: "Perusahaan hanya melihat jumlah kontak per bulan, tanpa nama.",
  },
];

const PRINCIPLES = [
  { icon: "eye", title: "Jujur soal yang diukur", text: "Kami mengukur apa yang dirasakan orang, lewat pertanyaan yang mereka jawab sendiri. Tidak ada tebakan dari foto atau wajah." },
  { icon: "lock", title: "Privasi lebih dulu", text: "HR hanya melihat rata-rata tim dengan minimal 5 orang. Jawaban pribadi tetap milik karyawan." },
  { icon: "heart", title: "Bukan diagnosis", text: "Sikutaki adalah skrining. Kalau hasilnya perlu perhatian, kami arahkan ke psikolog, bukan memberi label." },
  { icon: "book", title: "Berbasis bukti", text: "Setiap angka di situs ini punya sumber. Data contoh selalu ditandai sebagai contoh." },
] as const;

const STORY = [
  { when: "Awal", text: "Sikutaki mencoba membaca kondisi tubuh, termasuk organ, dari sebuah foto." },
  { when: "Titik balik", text: "Organ hanya bisa dilihat lewat pemeriksaan medis seperti MRI. Kami berhenti, karena tidak bisa mempertanggungjawabkannya." },
  { when: "Sekarang", text: "Check-in mingguan yang diisi sendiri, dashboard anonim untuk HR, dan rujukan ke psikolog." },
  { when: "Berikutnya", text: "Pilot 3 bulan bersama satu tim, lalu laporan hasil yang terbuka." },
];

export function AboutPage() {
  return (
    <>
      <PageHero icon="people" eyebrow="Tentang kami" title="Satu perusahaan, saling terhubung."
        text="Sikutaki menghubungkan karyawan, HR, pimpinan tim, dan psikolog mitra dalam satu ritme mingguan, tanpa membuka data pribadi siapa pun." />

      {/* Mosaic of workplace moments, then the product facts. */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[200px] sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
            {MOMENTS.map((m, i) => (
              <figure key={m.src} className={cn("group relative overflow-hidden rounded-[24px] bg-canvas sm:rounded-[32px]", m.tile)}>
                <img src={asset(m.src)} alt={m.alt} loading={i === 0 ? "eager" : "lazy"}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {i === 0 ? (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,.6)_100%)]" />
                    <figcaption className="absolute right-5 bottom-5 left-5 max-w-[460px] text-[17px] font-medium text-white sm:right-8 sm:bottom-8 sm:left-8 sm:text-[24px] sm:leading-snug">
                      Dibuat untuk perusahaan yang ingin bertindak lebih awal, untuk tim, bukan untuk individu.
                    </figcaption>
                  </>
                ) : (
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12.5px] font-medium text-ink backdrop-blur sm:bottom-4 sm:left-4 sm:text-[13.5px]">
                    {m.label}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-6 sm:gap-4">
            {FACTS.map((f) => (
              <div key={f.unit} className="grid content-start gap-1 rounded-[20px] bg-canvas px-2 py-5 text-center sm:rounded-[28px] sm:p-7">
                <b className="text-[34px] leading-none font-semibold tracking-[-0.04em] text-ink sm:text-[56px]">
                  {f.value}<span className="mt-1 block text-[14px] font-medium tracking-normal text-brand sm:mt-0 sm:ml-1.5 sm:inline sm:text-[22px]">{f.unit}</span>
                </b>
                <span className="hidden text-[15px] text-muted sm:block">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Band tone="grey">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <BandHead align="left" eyebrow="Kenapa kami ada" title="Masalahnya sering terlihat terlambat." />
          <div className="grid content-start gap-5 text-[18px] leading-relaxed text-body">
            <p>Masalah kesehatan mental di tempat kerja sering baru terlihat saat orang sudah kelelahan atau keluar. Survei tahunan terlalu jarang, dan karyawan ragu jujur kalau jawabannya bisa dikenali.</p>
            <p>Karena itu kami membuat check-in singkat yang aman untuk dijawab jujur, dan dashboard yang membantu HR melihat tim mana yang perlu perhatian minggu ini.</p>
          </div>
        </div>
      </Band>

      {/* The weekly loop that connects the roles. */}
      <Band>
        <BandHead eyebrow="Cara kerjanya" title="Satu ritme mingguan untuk seluruh perusahaan."
          text="Setiap orang punya peran kecil. Bersama-sama, perusahaan bisa melihat lebih awal dan bertindak lebih cepat." />
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <span aria-hidden className="absolute top-[52px] right-[12%] left-[12%] hidden h-0.5 bg-[linear-gradient(90deg,#9cc8fb,var(--color-brand))] lg:block" />
          {RHYTHM.map((s, i) => (
            <li key={s.title} className="relative grid content-start gap-4 rounded-[28px] bg-canvas p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <GradientIcon name={s.icon} />
                <span className="num text-[13px] font-semibold text-muted">Langkah {i + 1}</span>
              </div>
              <span className="justify-self-start rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-brand">{s.who}</span>
              <b className="text-[20px] font-semibold tracking-[-0.01em] text-ink">{s.title}</b>
              <p className="text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[15px] text-muted">
          <Icon name="calendar" size={16} className="text-brand" />Lalu kembali ke langkah 1 minggu depan, dengan catatan tindakan yang bisa dibandingkan.
        </p>
      </Band>

      {/* Who is connected and what each of them gets. */}
      <Band tone="grey">
        <div className="mb-10 grid items-center gap-8 sm:mb-14 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="grid gap-3">
            <span className="text-[15px] font-semibold text-brand">Siapa yang terhubung</span>
            <h2 className="text-[clamp(30px,4.4vw,52px)] font-semibold tracking-[-0.03em]">Setiap peran mendapat yang ia butuhkan, dan tidak lebih.</h2>
            <p className="text-[17px] text-muted sm:text-[20px]">Data mengalir sebagai rata-rata ke atas dan sebagai dukungan pribadi ke karyawan. Batasnya sama untuk semua.</p>
          </div>
          <div className="relative overflow-hidden rounded-[32px]">
            <img src={asset("/img/tentang/tangan.jpg")} alt="Tangan rekan kerja yang bertumpuk sebagai tanda kebersamaan" loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              {["Karyawan", "HR", "Pimpinan tim", "Psikolog mitra"].map((r) => (
                <span key={r} className="rounded-full bg-white/90 px-3 py-1 text-[12.5px] font-medium text-ink backdrop-blur">{r}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.title} className="grid content-start gap-5 rounded-[28px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,.04)] sm:p-8">
              <div className="flex items-center gap-4">
                <GradientIcon name={r.icon} />
                <b className="text-[21px] font-semibold tracking-[-0.01em] text-ink">{r.title}</b>
              </div>
              <ul className="grid gap-2.5">
                {r.gets.map((g) => (
                  <li key={g} className="flex items-start gap-2.5 text-[15.5px] text-body">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-brand"><Icon name="check" size={12} stroke={2.6} /></span>{g}
                  </li>
                ))}
              </ul>
              <p className="flex items-start gap-2 rounded-2xl bg-canvas px-4 py-3 text-[14px] text-muted">
                <Icon name="lock" size={15} className="mt-0.5 shrink-0 text-brand" />{r.never}
              </p>
            </div>
          ))}
        </div>
      </Band>

      <Band>
        <BandHead eyebrow="Prinsip kami" title="Empat hal yang tidak kami tawar." />
        <div className="grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map((p) => <FeatureCard key={p.title} icon={p.icon} title={p.title} className="bg-canvas shadow-none">{p.text}</FeatureCard>)}
        </div>
      </Band>

      <Band tone="grey">
        <BandHead eyebrow="Perjalanan kami" title="Kami pernah salah arah, dan memilih berbalik." />
        <ol className="relative grid gap-4 lg:grid-cols-4 lg:gap-5">
          <span aria-hidden className="absolute top-[22px] right-[12%] left-[12%] hidden h-0.5 bg-[linear-gradient(90deg,#9cc8fb,var(--color-brand))] lg:block" />
          {STORY.map((s, i) => (
            <li key={s.when} className="relative grid grid-cols-[44px_1fr] gap-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr] lg:justify-items-center lg:text-center">
              <span className="relative z-[1] inline-flex size-11 items-center justify-center rounded-full bg-brand text-[16px] font-semibold text-white ring-8 ring-canvas">{i + 1}</span>
              <div className="grid content-start gap-1.5 self-stretch rounded-[24px] bg-white p-5 lg:w-full lg:p-6">
                <b className="text-[18px] font-semibold text-ink">{s.when}</b>
                <p className="text-[15px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      <CtaBand title="Mau mencoba bersama tim Anda?" text="Kami sedang mencari perusahaan untuk pilot 3 bulan."
        primary={{ label: "Hubungi kami", href: ROUTES.contact }} secondary={{ label: "Coba dashboard HR", href: ROUTES.demo.hr }} />
    </>
  );
}
