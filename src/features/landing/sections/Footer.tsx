import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ROUTES } from "@/lib/paths";
import { container, Ref } from "../components/ui";
import { SOURCES } from "../content";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Produk", links: [{ label: "Dashboard HR", href: ROUTES.hr.root }, { label: "Aplikasi karyawan", href: ROUTES.employee.root }, { label: "17 Area", href: "#area" }] },
  { title: "Perusahaan", links: [{ label: "Kenapa Sikutaki", href: "#kenapa" }, { label: "Kontak", href: "#demo" }] },
  { title: "Legal", links: [{ label: "Kebijakan privasi", href: "#sumber" }, { label: "Syarat dan ketentuan", href: "#sumber" }] },
];

export function Footer() {
  return (
    <footer className="bg-white pt-14 pb-9 text-[14.5px]">
      <div className={`${container} grid grid-cols-2 gap-7 sm:grid-cols-[2fr_1fr_1fr_1fr]`}>
        <div className="col-span-full sm:col-span-1"><Logo size={30} className="text-[21px]" /></div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <b className="mb-3 block font-semibold">{col.title}</b>
            {col.links.map((l) => <Link key={l.label} href={l.href} className="mb-2 block text-muted hover:text-brand">{l.label}</Link>)}
          </div>
        ))}
      </div>
      <div id="sumber" className={`${container} mt-10 grid gap-3 border-t border-line pt-6 text-[12.5px] text-muted`}>
        <ol className="grid gap-1">
          {SOURCES.map((s) => (
            <li key={s.n}>[{s.n}] {s.text}. <a href={s.url} target="_blank" rel="noreferrer" className="break-all text-brand">{s.url.replace(/^https:\/\//, "")}</a></li>
          ))}
        </ol>
        <p>
          Sikutaki adalah alat skrining dan pemantauan kesehatan mental, bukan alat diagnosis medis, dan tidak menggantikan psikolog atau psikiater.
          Butuh bantuan sekarang? Hubungi Healing119 (telepon 119 ekstensi 8). Dalam keadaan darurat, hubungi 112.
          Data kesehatan diperlakukan sebagai data pribadi spesifik sesuai UU PDP <Ref n={3} />.
        </p>
        <p>Foto orang: Pexels, digunakan sesuai Lisensi Pexels. Nama dan angka di tampilan aplikasi adalah data contoh.</p>
        <p>© 2026 Sikutaki</p>
      </div>
    </footer>
  );
}
