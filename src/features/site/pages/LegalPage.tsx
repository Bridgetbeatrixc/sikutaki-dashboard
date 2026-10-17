import Link from "next/link";
import { ROUTES } from "@/lib/paths";
import { container } from "@/features/landing/components/ui";
import { DEMO_EMAIL } from "@/features/landing/content";
import { PageHero, ProtoNote } from "../ui";

type Section = { title: string; body: string[] };

const PRIVACY: Section[] = [
  { title: "Data yang kami kumpulkan", body: [
    "Dari karyawan: mood harian, jam tidur, jawaban check-in mingguan untuk 42 area, dan penyebab yang dipilih.",
    "Dari HR: nama perusahaan, struktur divisi, dan catatan tindak lanjut yang ditulis HR.",
  ] },
  { title: "Siapa yang bisa melihat apa", body: [
    "Karyawan melihat catatan dan insight pribadinya sendiri.",
    "HR hanya melihat rata-rata divisi yang berisi minimal 5 orang. Jawaban perorangan tidak pernah ditampilkan ke perusahaan.",
    "Psikolog mitra hanya menerima rujukan yang disetujui karyawan.",
  ] },
  { title: "Dasar hukum", body: [
    "Data kesehatan diperlakukan sebagai data pribadi spesifik sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, dan hanya diproses dengan persetujuan karyawan.",
  ] },
  { title: "Hak Anda", body: [
    "Karyawan berhak melihat, memperbaiki, dan meminta penghapusan datanya, serta menarik persetujuan kapan saja.",
  ] },
  { title: "Kontak", body: [`Pertanyaan tentang privasi dapat dikirim ke ${DEMO_EMAIL}.`] },
];

const TERMS: Section[] = [
  { title: "Tentang layanan", body: [
    "Sikutaki adalah alat skrining dan pemantauan kesehatan mental untuk tim. Sikutaki bukan alat diagnosis medis dan tidak menggantikan psikolog, psikiater, atau layanan darurat.",
  ] },
  { title: "Akun perusahaan", body: [
    "Perusahaan bertanggung jawab atas akun HR dan undangan ke karyawan. Karyawan ikut serta secara sukarela dan bisa berhenti kapan saja.",
  ] },
  { title: "Penggunaan yang tidak diizinkan", body: [
    "Data Sikutaki tidak boleh dipakai untuk menilai kinerja, menentukan promosi, atau mengambil keputusan tentang karyawan tertentu.",
  ] },
  { title: "Keadaan darurat", body: [
    "Jika Anda atau orang lain dalam bahaya, hubungi 112. Untuk dukungan psikologis, hubungi Healing119 di 119 ekstensi 8.",
  ] },
  { title: "Perubahan", body: ["Kami akan memberi tahu perusahaan sebelum syarat ini berubah."] },
];

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const sections = kind === "privacy" ? PRIVACY : TERMS;
  const title = kind === "privacy" ? "Kebijakan privasi" : "Syarat dan ketentuan";
  const other = kind === "privacy" ? { href: ROUTES.terms, label: "Syarat dan ketentuan" } : { href: ROUTES.privacy, label: "Kebijakan privasi" };

  return (
    <>
      <PageHero icon={kind === "privacy" ? "lock" : "file"} eyebrow="Legal" title={title}>
        <ProtoNote className="mt-2">Draf untuk prototipe, ditulis dalam bahasa sehari-hari. Belum ditinjau ahli hukum dan belum berlaku.</ProtoNote>
      </PageHero>
      <div className={`${container} grid gap-10 pb-24 lg:grid-cols-[220px_1fr] lg:gap-16`}>
        <nav aria-label="Isi halaman" className="hidden lg:block">
          <ol className="sticky top-24 grid gap-1 border-l border-line text-[14px]">
            {sections.map((s, i) => (
              <li key={s.title}><a href={`#bagian-${i + 1}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-muted hover:border-brand hover:text-ink">{s.title}</a></li>
            ))}
          </ol>
        </nav>
        <article className="grid max-w-[720px] gap-10">
          {sections.map((s, i) => (
            <section key={s.title} id={`bagian-${i + 1}`} className="grid scroll-mt-24 gap-3">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]"><span className="mr-2 text-brand">{i + 1}.</span>{s.title}</h2>
              {s.body.map((p) => <p key={p} className="text-[17px] leading-relaxed text-body">{p}</p>)}
            </section>
          ))}
          <p className="border-t border-line pt-6 text-[15px] text-muted">
            Lihat juga <Link href={other.href} className="text-brand hover:underline">{other.label}</Link> dan <Link href={ROUTES.security} className="text-brand hover:underline">Keamanan & Privasi</Link>.
          </p>
        </article>
      </div>
    </>
  );
}
