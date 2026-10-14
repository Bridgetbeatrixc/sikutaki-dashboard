import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ROUTES } from "@/lib/paths";
import { container, pillButton } from "../components/ui";

const ANCHORS = [
  { href: "#dashboard", label: "Dashboard" },
  { href: "#kenapa", label: "Kenapa Sikutaki" },
  { href: "#area", label: "17 Area" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[.06] bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className={`${container} flex h-14 items-center justify-between gap-6 sm:h-[60px]`}>
        <Logo size={30} className="text-[20px]" />
        <nav className="hidden gap-8 text-[14px] text-body lg:flex" aria-label="Bagian halaman">
          {ANCHORS.map((a) => <a key={a.href} href={a.href} className="hover:text-brand">{a.label}</a>)}
        </nav>
        <div className="flex items-center gap-6 text-[14px] text-body">
          <Link href={ROUTES.hr.root} className="hidden hover:text-brand sm:inline">Dashboard HR</Link>
          <Link href={ROUTES.employee.root} className="hidden hover:text-brand md:inline">Aplikasi karyawan</Link>
          <a href="#demo" className={pillButton()}>Jadwalkan demo</a>
        </div>
      </div>
    </header>
  );
}
