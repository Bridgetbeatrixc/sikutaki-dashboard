"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { APP_NAV } from "./content";
import { useEmployee } from "./EmployeeProvider";

const E = ROUTES.employee;
const strip = (p: string) => p.replace(/\/$/, "") || "/";
const within = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** Welcome, check-in, the calm-down tool and the exercise player take the whole phone screen. */
const isFullScreen = (path: string) =>
  path === E.root || path === E.checkin || path === E.calm || path.startsWith(`${E.exercises}/`);

/**
 * Frame of the employee app. On a phone it is a full-screen app with a bottom tab bar;
 * on a larger screen the same screens sit in a centred column under a top navigation bar.
 */
export function EmployeeShell({ children }: { children: ReactNode }) {
  const path = strip(usePathname());
  const { user, company, toastMsg } = useEmployee();
  const full = isFullScreen(path);
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-dvh bg-white text-ink">
      <div className="bg-ink px-4 py-2 text-center text-[13px] text-white print:hidden">Versi frontend: datamu tersimpan di peramban ini saja.</div>

      <header className={cn("sticky top-0 z-20 print:hidden border-b border-line bg-white/90 backdrop-blur md:border-0 md:bg-white/70", full && "hidden md:block")}>
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 md:h-16 md:px-8">
          <div className="flex items-center gap-2">
            <Logo size={26} href={E.home} />
            <span className="hidden text-[13px] font-medium whitespace-nowrap text-muted xl:inline">· {company.name}</span>
          </div>
          <nav aria-label="Menu aplikasi" className="ml-2 hidden items-center gap-0.5 md:flex lg:ml-6 lg:gap-1">
            {APP_NAV.map((item) => {
              const on = within(path, item.href);
              return (
                <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined}
                  className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-semibold whitespace-nowrap lg:px-3.5", on ? "bg-app text-white" : "text-[#4b5768] hover:bg-soft")}>
                  <Icon name={item.icon} size={17} />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href={E.calm} aria-label="Saat cemas" className="hidden items-center gap-1.5 rounded-full bg-[#fdf0f2] px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-[#8a2b3d] md:inline-flex lg:px-3.5">
              <Icon name="heart" size={15} /><span className="hidden lg:inline">Saat cemas</span>
            </Link>
            <Link href={E.profile} aria-label="Profil dan akun" aria-current={path === E.profile ? "page" : undefined}
              className={cn("grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#cddaeb,#f1e6c8)] text-[15px] font-bold text-app-dark", path === E.profile && "ring-2 ring-app")}>
              {initial}
            </Link>
          </div>
        </div>
      </header>

      <div className="print:p-0">
        {/* No frame: the page uses the screen width; focused flows stay in a readable centred column. */}
        <main className={cn(
          "relative mx-auto flex w-full flex-col bg-white [&>*]:flex-1 print:max-w-none print:min-h-0",
          full ? "min-h-dvh md:min-h-[calc(100dvh-64px)] md:max-w-[720px] md:pt-4" : "min-h-[calc(100dvh-56px)] max-w-[1200px] md:min-h-[calc(100dvh-100px)]",
        )}>
          {children}
        </main>
      </div>

      {!full && <BottomNav path={path} />}

      {toastMsg && (
        <div role="status" className="print:hidden animate-fade-up fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-1/2 z-[70] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-[11px] text-sm text-white shadow-2xl md:bottom-8">
          <Icon name="info" size={16} />{toastMsg}
        </div>
      )}
    </div>
  );
}

/** Floating tab bar on phones. */
function BottomNav({ path }: { path: string }) {
  return (
    <nav aria-label="Menu aplikasi"
      className="fixed inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom))] z-30 grid print:hidden h-[70px] grid-cols-5 items-center rounded-3xl bg-[#f2f4f8]/90 px-1 shadow-[0_10px_30px_rgba(0,0,0,.15),inset_0_0_0_1px_rgba(255,255,255,.8)] backdrop-blur-md md:hidden">
      {APP_NAV.map((item) => {
        const on = within(path, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined}
            className={cn("grid justify-items-center gap-[3px] py-1.5", on ? "text-app-dark" : "text-[#6f7c8e]")}>
            <span className={cn("grid h-[30px] w-11 place-items-center rounded-xl transition-colors", on && "bg-app text-white shadow-[0_6px_14px_rgba(8,87,214,.3)]")}>
              <Icon name={item.icon} size={22} />
            </span>
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
