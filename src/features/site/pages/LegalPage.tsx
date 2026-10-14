import Link from "next/link";
import { ROUTES } from "@/lib/paths";
import { container } from "@/features/landing/components/ui";
import { DEMO_EMAIL } from "@/features/landing/content";
import { ProtoNote } from "../ui";

type Section = { title: string; body: string[] };

const PRIVACY: Section[] = [
  { title: "Data yang kami kumpulkan", body: [
    "Dari karyawan: mood harian, jam tidur, jawaban check-in mingguan untuk 17 area, dan penyebab yang dipilih.",
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
    <article className={`${container} grid max-w-[760px] gap-8 pt-14 pb-20 sm:pt-20`}>
      <header className="grid gap-4">
        <h1 className="text-[clamp(36px,5vw,56px)] font-semibold">{title}</h1>
        <ProtoNote>Draf untuk prototipe, ditulis dalam bahasa sehari-hari. Belum ditinjau ahli hukum dan belum berlaku.</ProtoNote>
      </header>
      {sections.map((s, i) => (
        <section key={s.title} className="grid gap-3">
          <h2 className="text-[22px] font-semibold">{i + 1}. {s.title}</h2>
          {s.body.map((p) => <p key={p} className="text-[17px] leading-relaxed text-body">{p}</p>)}
        </section>
      ))}
      <p className="border-t border-line pt-6 text-[15px] text-muted">
        Lihat juga <Link href={other.href} className="text-brand hover:underline">{other.label}</Link> dan <Link href={ROUTES.security} className="text-brand hover:underline">Keamanan dan privasi</Link>.
      </p>
    </article>
  );
}
