"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { container } from "@/features/landing/components/ui";
import { isCurrent, MAIN_NAV } from "./nav";

/** Frosted top bar for every marketing page, with a full-screen menu on phones and tablets. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // The menu sits outside <header>: its backdrop blur would otherwise trap the fixed overlay inside the bar.
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className={`${container} flex h-14 items-center gap-4 sm:h-16`}>
          <Logo size={30} className="mr-auto text-[20px] lg:mr-0 lg:flex-1" />

          <nav className="hidden items-center gap-1 rounded-full bg-black/[.035] p-1 lg:flex" aria-label="Menu utama">
            {MAIN_NAV.map((n) => {
              const on = isCurrent(pathname, n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined}
                  className={cn("rounded-full px-4 py-1.5 text-[14px] transition-colors",
                    on ? "bg-white font-medium text-ink shadow-[0_1px_3px_rgba(0,0,0,.08)]" : "text-body hover:text-ink")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2 lg:flex-1">
            <Link href={ROUTES.login}
              className={cn("hidden rounded-full px-4 py-2 text-[14px] font-medium sm:inline-flex", isCurrent(pathname, ROUTES.login) ? "text-brand" : "text-ink hover:bg-black/5")}>
              Masuk
            </Link>
            <Link href={ROUTES.signup} className="inline-flex rounded-full bg-brand px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-brand-hover">
              Daftar
            </Link>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-ponsel"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-black/5 lg:hidden">
              <Icon name={open ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="menu-ponsel" className="fixed inset-x-0 top-14 bottom-0 z-40 animate-rise overflow-y-auto bg-white sm:top-16 lg:hidden">
          <nav aria-label="Menu utama" className={`${container} grid gap-1 pt-4 pb-10`}>
            {MAIN_NAV.map((n) => {
              const on = isCurrent(pathname, n.href);
              return (
                <Link key={n.href} href={n.href} onClick={close} aria-current={on ? "page" : undefined}
                  className={cn("flex items-center justify-between rounded-2xl px-4 py-4 text-[22px] font-semibold tracking-[-0.02em]",
                    on ? "bg-mint text-brand" : "text-ink hover:bg-canvas")}>
                  {n.label}<Icon name="chevron" size={20} className={on ? "text-brand" : "text-[#c7c7cc]"} />
                </Link>
              );
            })}
            <div className="mt-6 grid gap-3 border-t border-line pt-6">
              <Link href={ROUTES.signup} onClick={close} className="rounded-full bg-brand py-3.5 text-center text-[17px] font-medium text-white">Daftar</Link>
              <Link href={ROUTES.login} onClick={close} className="rounded-full bg-canvas py-3.5 text-center text-[17px] font-medium text-ink">Masuk</Link>
            </div>
            <div className="mt-6 grid gap-1 text-[15px] text-muted">
              <Link href={ROUTES.hr.root} onClick={close} className="py-2">Coba dashboard HR</Link>
              <Link href={ROUTES.employee.root} onClick={close} className="py-2">Coba aplikasi karyawan</Link>
              <Link href={ROUTES.pricing} onClick={close} className="py-2">Harga</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
