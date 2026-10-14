/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { asset, ROUTES } from "@/lib/paths";
import { pillButton, textLink } from "@/features/landing/components/ui";
import { Icon } from "@/components/ui/Icon";
import { Band, BandHead, PageIntro, Tile } from "../ui";

const PRINCIPLES = [
  { icon: "eye", title: "Jujur soal yang diukur", text: "Kami mengukur apa yang dirasakan orang, lewat pertanyaan yang mereka jawab sendiri. Tidak ada tebakan dari foto atau wajah." },
  { icon: "lock", title: "Privasi lebih dulu", text: "HR hanya melihat rata-rata tim dengan minimal 5 orang. Jawaban pribadi tetap milik karyawan." },
  { icon: "heart", title: "Bukan diagnosis", text: "Sikutaki adalah skrining. Kalau hasilnya perlu perhatian, kami arahkan ke psikolog, bukan memberi label." },
  { icon: "book", title: "Berbasis bukti", text: "Setiap angka di situs ini punya sumber. Data contoh selalu ditandai sebagai contoh." },
] as const;

const STORY = [
  { when: "Awal", text: "Sikutaki mencoba membaca kondisi tubuh, termasuk organ, dari sebuah foto." },
  { when: "Titik balik", text: "Organ hanya bisa dilihat lewat pemeriksaan medis seperti MRI, dan studi tentang membaca penyakit dari ciri luar tubuh hasilnya tidak lebih baik dari menebak. Kami berhenti." },
  { when: "Sekarang", text: "Kami fokus ke kesehatan mental tim: check-in mingguan yang diisi sendiri, dashboard anonim untuk HR, dan rujukan ke psikolog." },
  { when: "Berikutnya", text: "Pilot 3 bulan bersama satu tim, lalu laporan hasil yang terbuka, termasuk apa yang tidak berhasil." },
];

export function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Tentang kami" title="Cara yang jujur untuk menjaga kesehatan mental tim."
        text="Sikutaki membantu perusahaan melihat kondisi tim setiap minggu, tanpa membuka data pribadi siapa pun." />

      <Band tone="grey">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img src={asset("/img/final-team.jpg")} alt="Tim kerja sedang berdiskusi di kantor" className="aspect-[4/3] w-full rounded-[28px] object-cover" />
          <div className="grid gap-5">
            <h2 className="text-[clamp(30px,4vw,44px)] font-semibold">Kenapa kami ada</h2>
            <p className="text-[17px] leading-relaxed text-body">
              Masalah kesehatan mental di tempat kerja sering baru terlihat saat orang sudah kelelahan atau keluar.
              Survei tahunan terlalu jarang, dan karyawan ragu jujur kalau jawabannya bisa dikenali.
            </p>
            <p className="text-[17px] leading-relaxed text-body">
              Kami membuat check-in singkat yang aman untuk dijawab jujur, dan dashboard yang membantu HR bertindak lebih awal untuk tim, bukan untuk individu.
            </p>
            <Link href={ROUTES.security} className={textLink}>Cara kami menjaga privasi <Icon name="chevron" size={16} /></Link>
          </div>
        </div>
      </Band>

      <Band>
        <BandHead title="Prinsip kami" />
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => <Tile key={p.title} icon={p.icon} title={p.title} className="bg-canvas">{p.text}</Tile>)}
        </div>
      </Band>

      <Band tone="grey">
        <BandHead title="Perjalanan kami" text="Kami pernah salah arah, dan memilih untuk berbalik." />
        <ol className="mx-auto grid max-w-[760px] gap-3">
          {STORY.map((s, i) => (
            <li key={s.when} className="grid grid-cols-[40px_1fr] gap-4 rounded-[22px] bg-white p-5 sm:p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-[15px] font-semibold text-white">{i + 1}</span>
              <div className="grid gap-1">
                <b className="text-[17px] font-semibold text-ink">{s.when}</b>
                <p className="text-[15px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      <Band>
        <div className="grid justify-items-center gap-5 text-center">
          <h2 className="text-[clamp(30px,4vw,44px)] font-semibold">Mau mencoba bersama tim Anda?</h2>
          <p className="max-w-[560px] text-[17px] text-muted">Kami sedang mencari perusahaan untuk pilot 3 bulan.</p>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            <Link href={ROUTES.contact} className={pillButton("primary", true)}>Hubungi kami</Link>
            <Link href={ROUTES.hr.root} className={`${textLink} text-[17px]`}>Coba dashboard HR <Icon name="chevron" size={16} /></Link>
          </div>
        </div>
      </Band>
    </>
  );
}
