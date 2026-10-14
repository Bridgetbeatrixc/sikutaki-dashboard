import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { textLink } from "@/features/landing/components/ui";
import { Band, BandHead, PageIntro, Tile } from "../ui";

const RULES = [
  { icon: "people", title: "Minimal 5 orang", text: "HR hanya melihat rata-rata tim yang berisi minimal 5 orang. Tim yang lebih kecil disembunyikan, seperti tim Legal di demo." },
  { icon: "eye", title: "Jawaban pribadi tetap pribadi", text: "Catatan harian dan insight hanya terlihat oleh karyawan sendiri. Perusahaan tidak menerima jawaban per orang." },
  { icon: "heart", title: "Bukan alat diagnosis", text: "Sikutaki adalah skrining dan pemantauan. Hasil yang perlu perhatian diarahkan ke psikolog, tidak diberi label penyakit." },
  { icon: "shield", title: "Data kesehatan dilindungi", text: "Data kesehatan termasuk data pribadi spesifik menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi." },
] as const;

const NOW = [
  "Semua halaman statis, dengan data contoh yang disimpan di kode.",
  "Isian karyawan hanya disimpan sementara di browser dan hilang saat halaman di-refresh.",
  "Tidak ada akun sungguhan. Halaman masuk dan daftar hanya untuk demo.",
];

const PLANNED = [
  "Backend API dan database, dengan login lewat akun kantor.",
  "Jawaban perorangan disimpan terpisah dari identitas.",
  "Aturan minimal 5 orang dijaga di server, bukan hanya disembunyikan di tampilan.",
  "Akses data dibatasi per peran, dan karyawan bisa meminta datanya dihapus.",
];

export function SecurityPage() {
  return (
    <>
      <PageIntro eyebrow="Keamanan dan privasi" title="Aman untuk dijawab jujur."
        text="Check-in hanya berguna kalau karyawan merasa aman. Ini aturan yang kami pegang." />

      <Band tone="grey">
        <div className="grid gap-4 sm:grid-cols-2">
          {RULES.map((r) => <Tile key={r.title} icon={r.icon} title={r.title}>{r.text}</Tile>)}
        </div>
      </Band>

      <Band>
        <BandHead title="Apa yang sudah ada, dan apa yang direncanakan" text="Kami terbuka soal tahap produk saat ini." />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid content-start gap-4 rounded-[22px] bg-canvas p-6 sm:p-7">
            <b className="text-[19px] font-semibold text-ink">Sekarang: prototipe</b>
            <ul className="grid gap-2.5">{NOW.map((t) => <li key={t} className="flex gap-2.5 text-[15px] text-body"><Icon name="info" size={18} className="mt-0.5 shrink-0 text-muted" />{t}</li>)}</ul>
          </div>
          <div className="grid content-start gap-4 rounded-[22px] bg-canvas p-6 sm:p-7">
            <b className="text-[19px] font-semibold text-ink">Rencana untuk produksi</b>
            <ul className="grid gap-2.5">{PLANNED.map((t) => <li key={t} className="flex gap-2.5 text-[15px] text-body"><Icon name="check" size={18} stroke={2.2} className="mt-0.5 shrink-0 text-brand" />{t}</li>)}</ul>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <div className="mx-auto grid max-w-[760px] gap-4 rounded-[28px] bg-white p-7 sm:p-9">
          <span className="inline-flex size-11 items-center justify-center rounded-[14px] bg-bad-bg text-bad"><Icon name="phone" size={22} /></span>
          <h2 className="text-[28px] font-semibold">Butuh bantuan sekarang?</h2>
          <p className="text-[17px] leading-relaxed text-body">
            Hubungi layanan dukungan psikologis Kemenkes, Healing119, di telepon 119 ekstensi 8. Dalam keadaan darurat, hubungi 112.
            Sikutaki tidak menggantikan layanan krisis.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
            <Link href={ROUTES.privacy} className={textLink}>Kebijakan privasi <Icon name="chevron" size={15} /></Link>
            <Link href={ROUTES.contact} className={textLink}>Tanya soal keamanan <Icon name="chevron" size={15} /></Link>
          </div>
        </div>
      </Band>
    </>
  );
}
