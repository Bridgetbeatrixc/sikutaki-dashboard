"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { container, pillButton } from "@/features/landing/components/ui";
import { isCurrent, MAIN_NAV } from "./nav";

/** Frosted top bar for every marketing page, with a full menu on phones. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/[.06] bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className={`${container} flex h-14 items-center justify-between gap-6 sm:h-[60px]`}>
        <Logo size={30} className="text-[20px]" />
        <nav className="hidden gap-8 text-[14px] text-body lg:flex" aria-label="Menu utama">
          {MAIN_NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}
              className={cn("hover:text-brand", isCurrent(pathname, n.href) && "font-medium text-ink")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-[14px] text-body">
          <Link href={ROUTES.login} className="hidden hover:text-brand sm:inline">Masuk</Link>
          <Link href={ROUTES.signup} className={pillButton()}>Daftar</Link>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-ponsel"
            aria-label={open ? "Tutup menu" : "Buka menu"} className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-black/5 lg:hidden">
            <Icon name={open ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-ponsel" aria-label="Menu utama" className="border-t border-black/[.06] bg-white lg:hidden">
          <div className={`${container} grid py-3`}>
            {MAIN_NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={close}
                className="border-b border-line py-3.5 text-[17px] font-medium text-ink">{n.label}</Link>
            ))}
            <div className="grid gap-2.5 pt-4 pb-2">
              <Link href={ROUTES.hr.root} onClick={close} className="py-1.5 text-[15px] text-body">Coba dashboard HR</Link>
              <Link href={ROUTES.employee.root} onClick={close} className="py-1.5 text-[15px] text-body">Coba aplikasi karyawan</Link>
              <Link href={ROUTES.login} onClick={close} className="py-1.5 text-[15px] text-body">Masuk</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
