"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { logout } from "@/store/account";
import { useHr } from "./HrProvider";
import { HR_NAV, isActive, NAV_DIVIDER_AFTER } from "./nav";
import { EmptyState } from "./EmptyState";

/** Frame of the HR dashboard: sidebar (icon rail on tablet), sticky top bar, bottom bar on phones. */
export function HrShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { m, scope, setScope, toastMsg } = useHr();
  const [bellOpen, setBellOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const empty = m.isEmpty;
  const al = m.alerts();
  const initials = m.ds.user.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const teamsWithAlerts = new Set(al.map((a) => a.team)).size;
  const section = pathname.replace(ROUTES.hr.root, "").split("/").filter(Boolean)[0];
  const showScope = !empty && section === "area";
  const showEmpty = empty && ["divisi", "area", "laporan"].includes(section ?? "");

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden print:hidden h-screen w-[72px] shrink-0 flex-col items-center gap-[18px] border-r border-line bg-white px-2.5 py-4 sm:flex xl:w-[232px] xl:items-stretch xl:px-3 xl:py-[18px]">
        <Logo href={ROUTES.hr.root} className="px-0 text-lg xl:px-2 [&>span]:hidden xl:[&>span]:inline" />
        <nav className="grid gap-0.5">
          {HR_NAV.map((n, i) => (
            <div key={n.href} className={cn(i === NAV_DIVIDER_AFTER && "mb-2.5 border-b border-line pb-2.5")}>
              <Link href={n.href} title={n.label}
                className={cn("relative flex items-center justify-center gap-3 rounded-xl p-[11px] font-medium xl:justify-start xl:px-3 xl:py-2.5",
                  isActive(pathname, n.href) ? "bg-mint font-bold text-brand" : "text-muted hover:bg-[#f1f3f6] hover:text-ink")}>
                <Icon name={n.icon} size={19} />
                <span className="hidden xl:inline">{n.label}</span>
                {n.href === ROUTES.hr.divisions && teamsWithAlerts > 0 && (
                  <em className="ml-auto hidden rounded-full bg-bad px-[7px] py-px text-[11px] font-bold text-white not-italic xl:inline">{teamsWithAlerts}</em>
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-1.5 px-2.5 text-xs text-muted">
          <Icon name="lock" size={14} /><span className="hidden xl:inline">Anonim, min. 5 orang</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-ink print:hidden px-4 py-2 text-[13px] text-white sm:px-7">
          <span>Versi frontend: angka dashboard memakai data contoh. Perubahan Anda tersimpan di peramban ini saja.</span>
        </div>
        <header className="sticky top-0 z-20 print:hidden flex flex-wrap items-center gap-2.5 border-b border-line bg-canvas/90 px-4 py-2.5 backdrop-blur sm:flex-nowrap sm:gap-4 sm:px-7 sm:py-3">
          <div>
            <b className="block text-sm">{m.COMPANY.name}</b>
            <small className="hidden text-xs text-muted sm:inline">{m.COMPANY.employees} karyawan terdaftar</small>
          </div>
          {showScope && (
            <label className="order-3 w-full sm:order-none sm:w-auto">
              <span className="sr-only">Lingkup</span>
              <select className={cn(inputClass, "w-full")} value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Pilih divisi">
                <option value="all">Seluruh perusahaan</option>
                {m.TEAMS.filter((t) => !m.isHidden(t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          )}
          <div className="ml-auto flex items-center gap-2.5">
            <div className="relative">
              <button type="button" aria-label={`Notifikasi, ${al.length} baru`} onClick={() => setBellOpen(!bellOpen)}
                className="relative inline-flex size-[38px] items-center justify-center rounded-xl border border-line bg-white">
                <Icon name="bell" />
                {al.length > 0 && <i className="absolute top-2 right-[9px] size-2 rounded-full border-2 border-white bg-bad" />}
              </button>
              {bellOpen && (
                <div className="absolute top-[46px] right-0 z-40 grid w-[min(320px,calc(100vw-32px))] gap-0.5 rounded-[14px] border border-line bg-white p-2 shadow-xl">
                  <b className="px-2.5 py-1.5 text-[13px]">Notifikasi</b>
                  {al.length === 0 ? <span className="p-2.5 text-[13px] text-muted">Belum ada notifikasi.</span> : al.slice(0, 5).map((a) => (
                    <Link key={a.id} href={ROUTES.hr.division(a.team)} onClick={() => setBellOpen(false)} className="flex items-start gap-2 rounded-[10px] px-2.5 py-2 text-[13px] hover:bg-[#f1f3f6]">
                      <Icon name="flag" size={14} className="mt-0.5 shrink-0 text-bad" />{a.text}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setUserOpen(!userOpen)} aria-label="Menu akun" aria-expanded={userOpen}
                className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">{initials}</button>
              {userOpen && (
                <div className="absolute top-[46px] right-0 z-40 grid w-[240px] gap-0.5 rounded-[14px] border border-line bg-white p-2 shadow-xl">
                  <div className="px-2.5 py-1.5"><b className="block text-[13px]">{m.ds.user.name}</b><small className="block truncate text-muted">{m.ds.user.email}</small></div>
                  <Link href={ROUTES.hr.settings} onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[13px] hover:bg-[#f1f3f6]"><Icon name="cog" size={15} />Pengaturan</Link>
                  <form action={logout}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] hover:bg-[#f1f3f6]"><Icon name="logout" size={15} />Keluar</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="grid w-full max-w-[1320px] gap-3.5 px-4 pt-4 pb-24 sm:gap-[18px] sm:px-7 sm:pt-6 sm:pb-16">
          {showEmpty ? <EmptyState /> : children}
        </main>
      </div>

      {/* Phone navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 print:hidden grid grid-cols-5 border-t border-line bg-white px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] sm:hidden">
        {HR_NAV.slice(0, 4).map((n) => (
          <Link key={n.href} href={n.href} className={cn("grid justify-items-center gap-0.5 py-1 text-[10.5px] font-semibold", isActive(pathname, n.href) ? "text-brand" : "text-muted")}>
            <Icon name={n.icon} size={20} /><span>{n.label}</span>
          </Link>
        ))}
        <button type="button" onClick={() => setMoreOpen(!moreOpen)} className={cn("grid justify-items-center gap-0.5 py-1 text-[10.5px] font-semibold", moreOpen ? "text-brand" : "text-muted")}>
          <Icon name="more" size={20} /><span>Lainnya</span>
        </button>
      </nav>
      {moreOpen && (
        <div className="fixed inset-0 z-[29] bg-ink/30 sm:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] grid rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
            {HR_NAV.slice(4).map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-[10px] p-3 font-semibold"><Icon name={n.icon} />{n.label}</Link>
            ))}
          </div>
        </div>
      )}

      {toastMsg && (
        <div role="status" className="animate-fade-up fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-[11px] text-white shadow-2xl">
          <Icon name="check" size={16} />{toastMsg}
        </div>
      )}
    </div>
  );
}
