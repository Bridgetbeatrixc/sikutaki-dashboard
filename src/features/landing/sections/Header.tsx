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
    <header className="sticky top-0 z-30 bg-[#e9f6f1]/80 backdrop-blur-md">
      <div className={`${container} flex h-16 items-center justify-between gap-6 sm:h-[76px]`}>
        <Logo size={34} className="text-[21px] tracking-tight" />
        <nav className="hidden gap-[34px] text-[15px] font-medium lg:flex" aria-label="Bagian halaman">
          {ANCHORS.map((a) => <a key={a.href} href={a.href} className="hover:text-brand">{a.label}</a>)}
        </nav>
        <div className="flex items-center gap-[22px] text-[15px] font-medium">
          <Link href={ROUTES.hr.root} className="hidden hover:text-brand sm:inline">Dashboard HR</Link>
          <Link href={ROUTES.employee.root} className="hidden hover:text-brand md:inline">Aplikasi karyawan</Link>
          <a href="#demo" className={pillButton()}>Jadwalkan demo</a>
        </div>
      </div>
    </header>
  );
}
