import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { Band, BandHead, CtaBand, FeatureCard, PageHero } from "../ui";

const RULES = [
  { icon: "eye", title: "Jawaban pribadi tetap pribadi", text: "Catatan harian dan insight hanya terlihat oleh karyawan sendiri. Perusahaan tidak menerima jawaban per orang." },
  { icon: "heart", title: "Bukan alat diagnosis", text: "Sikutaki adalah skrining dan pemantauan. Hasil yang perlu perhatian diarahkan ke psikolog, tidak diberi label penyakit." },
  { icon: "shield", title: "Data kesehatan dilindungi", text: "Data kesehatan termasuk data pribadi spesifik menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi." },
  { icon: "check", title: "Ikut serta secara sukarela", text: "Karyawan bisa berhenti kapan saja, dan data Sikutaki tidak boleh dipakai untuk menilai kinerja." },
] as const;

const WHO = [
  { who: "Karyawan", sees: "Mood harian, jam tidur, hasil check-in, dan insight pribadinya sendiri", not: "jawaban rekan kerja" },
  { who: "HR", sees: "Rata-rata per divisi untuk 17 area, mood, dan tidur, bila timnya minimal 5 orang", not: "jawaban atau nama per orang" },
  { who: "Psikolog mitra", sees: "Rujukan yang disetujui karyawan", not: "data karyawan lain atau dashboard HR" },
];

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

/** Visual for the 5-person rule: a team of 4 stays hidden, a team of 12 shows its average. */
function TeamCard({ name, people, shown }: { name: string; people: number; shown: boolean }) {
  return (
    <div className="grid content-start gap-5 rounded-[28px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,.04)] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <b className="text-[19px] font-semibold text-ink">{name}</b>
        <span className="rounded-full bg-canvas px-3 py-1 text-[13px] text-muted">{people} orang</span>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-hidden>
        {Array.from({ length: people }, (_, i) => (
          <span key={i} className={cn("size-7 rounded-full", shown ? "bg-[linear-gradient(145deg,#9cc8fb,#3b8ef7)]" : "bg-[#d2d2d7]")} />
        ))}
      </div>
      <div className="grid gap-2">
        <span className="text-[14px] text-muted">Rata-rata tingkat stres</span>
        {shown ? (
          <div className="flex items-center gap-3">
            <span className="block h-2.5 flex-1 overflow-hidden rounded-full bg-track"><span className="block h-full w-[44%] rounded-full bg-brand" /></span>
            <b className="num text-[17px] font-semibold">44</b>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="block h-2.5 flex-1 rounded-full bg-hatch" />
            <span className="inline-flex items-center gap-1 text-[14px] font-medium text-muted"><Icon name="lock" size={14} />Disembunyikan</span>
          </div>
        )}
      </div>
      <p className={cn("rounded-2xl px-4 py-3 text-[14px]", shown ? "bg-mint text-brand" : "bg-canvas text-muted")}>
        {shown ? "Minimal 5 orang, jadi HR melihat rata-rata tim. Tetap tanpa nama." : "Kurang dari 5 orang, jadi datanya tidak ditampilkan ke HR sama sekali."}
      </p>
    </div>
  );
}

export function SecurityPage() {
  return (
    <>
      <PageHero icon="shield" eyebrow="Keamanan & Privasi" title="Aman untuk dijawab jujur."
        text="Check-in hanya berguna kalau karyawan merasa aman. Ini aturan yang kami pegang, dan cara kerjanya." />

      <Band tone="grey">
        <BandHead eyebrow="Aturan minimal 5 orang" title="HR melihat tim, bukan orang." text="Contoh di bawah memakai data contoh." />
        <div className="grid gap-5 lg:grid-cols-2">
          <TeamCard name="Tim Legal" people={4} shown={false} />
          <TeamCard name="Tim Keuangan" people={12} shown />
        </div>
      </Band>

      <Band>
        <BandHead eyebrow="Siapa melihat apa" title="Setiap orang hanya melihat bagiannya." />
        <div className="overflow-hidden rounded-[28px] border border-line">
          {WHO.map((w, i) => (
            <div key={w.who} className={cn("grid gap-3 p-6 sm:grid-cols-[180px_1fr_1fr] sm:gap-6 sm:p-7", i > 0 && "border-t border-line")}>
              <b className="text-[18px] font-semibold text-ink">{w.who}</b>
              <p className="flex gap-2.5 text-[15px] text-body"><Icon name="check" size={18} stroke={2.2} className="mt-0.5 shrink-0 text-brand" />{w.sees}</p>
              <p className="flex gap-2.5 text-[15px] text-muted"><Icon name="x" size={18} stroke={2.2} className="mt-0.5 shrink-0 text-bad" />Tidak melihat: {w.not}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <BandHead eyebrow="Prinsip" title="Yang selalu berlaku." />
        <div className="grid gap-5 sm:grid-cols-2">
          {RULES.map((r) => <FeatureCard key={r.title} icon={r.icon} title={r.title}>{r.text}</FeatureCard>)}
        </div>
      </Band>

      <Band>
        <BandHead eyebrow="Tahap produk" title="Apa yang sudah ada, dan apa yang direncanakan." text="Kami terbuka soal tahap produk saat ini." />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid content-start gap-5 rounded-[28px] bg-canvas p-7 sm:p-8">
            <span className="justify-self-start rounded-full bg-warn-bg px-3 py-1 text-[13px] font-semibold text-warn">Sekarang: prototipe</span>
            <ul className="grid gap-3">{NOW.map((t) => <li key={t} className="flex gap-3 text-[16px] text-body"><Icon name="info" size={19} className="mt-0.5 shrink-0 text-muted" />{t}</li>)}</ul>
          </div>
          <div className="grid content-start gap-5 rounded-[28px] bg-canvas p-7 sm:p-8">
            <span className="justify-self-start rounded-full bg-mint px-3 py-1 text-[13px] font-semibold text-brand">Rencana produksi</span>
            <ul className="grid gap-3">{PLANNED.map((t) => <li key={t} className="flex gap-3 text-[16px] text-body"><Icon name="check" size={19} stroke={2.2} className="mt-0.5 shrink-0 text-brand" />{t}</li>)}</ul>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <div className="mx-auto grid max-w-[900px] gap-5 rounded-[32px] bg-white p-7 sm:grid-cols-[auto_1fr] sm:gap-7 sm:p-10">
          <span className="inline-flex size-14 items-center justify-center rounded-[18px] bg-bad-bg text-bad"><Icon name="phone" size={26} /></span>
          <div className="grid gap-3">
            <h2 className="text-[28px] font-semibold">Butuh bantuan sekarang?</h2>
            <p className="text-[17px] leading-relaxed text-body">
              Hubungi layanan dukungan psikologis Kemenkes, Healing119, di telepon <b className="font-semibold text-ink">119 ekstensi 8</b>.
              Dalam keadaan darurat, hubungi <b className="font-semibold text-ink">112</b>. Sikutaki tidak menggantikan layanan krisis.
            </p>
            <Link href={ROUTES.privacy} className="inline-flex items-center gap-1 justify-self-start text-[15px] font-medium text-brand hover:underline">
              Baca kebijakan privasi <Icon name="chevron" size={15} />
            </Link>
          </div>
        </div>
      </Band>

      <CtaBand title="Punya pertanyaan soal data?" text="Tim kami siap menjelaskan cara kerja aturan privasi untuk perusahaan Anda."
        primary={{ label: "Hubungi kami", href: ROUTES.contact }} secondary={{ label: "Lihat dashboard HR", href: ROUTES.hr.root }} />
    </>
  );
}
