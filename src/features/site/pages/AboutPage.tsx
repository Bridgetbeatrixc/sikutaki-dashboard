/* eslint-disable @next/next/no-img-element */
import { asset, ROUTES } from "@/lib/paths";
import { Band, BandHead, CtaBand, FeatureCard, PageHero } from "../ui";

/** Product facts that are true for the prototype today. */
const FACTS = [
  { value: "17", unit: "area", text: "kesehatan mental yang dipantau, bukan cuma stres" },
  { value: "3", unit: "menit", text: "untuk check-in mingguan di ponsel" },
  { value: "5", unit: "orang", text: "minimal per tim sebelum HR melihat rata-rata" },
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
      <PageHero icon="people" eyebrow="Tentang kami" title="Kesehatan mental tim, dijaga dengan jujur."
        text="Sikutaki membantu perusahaan melihat kondisi tim setiap minggu, tanpa membuka data pribadi siapa pun." />

      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[36px]">
            <img src={asset("/img/final-team.jpg")} alt="Tim kerja sedang berdiskusi di kantor" className="aspect-[4/3] w-full object-cover sm:aspect-[21/9]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,.55)_100%)]" />
            <p className="absolute right-6 bottom-6 left-6 max-w-[620px] text-[19px] font-medium text-white sm:right-auto sm:bottom-10 sm:left-10 sm:text-[26px] sm:leading-snug">
              Dibuat untuk tim HR yang ingin bertindak lebih awal, untuk tim, bukan untuk individu.
            </p>
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
        primary={{ label: "Hubungi kami", href: ROUTES.contact }} secondary={{ label: "Coba dashboard HR", href: ROUTES.hr.root }} />
    </>
  );
}
