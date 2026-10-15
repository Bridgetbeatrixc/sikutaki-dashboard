"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { APP_NAV, FLOW } from "./content";
import { useEmployee } from "./EmployeeProvider";

const E = ROUTES.employee;
const strip = (p: string) => p.replace(/\/$/, "") || "/";
const within = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** The exercise player belongs to the Latihan tab. */
const activeHref = (path: string, href: string) => (href === E.root ? path === href : within(path, href));

/** Welcome, check-in, the calm-down tool and the exercise player take the whole screen without the bottom nav. */
const isFullScreen = (path: string) =>
  path === E.root || path === E.checkin || path === E.calm || path.startsWith(`${E.exercises}/`);

/**
 * Stage for the employee app: a flow guide next to a phone mockup. Every screen is its own route
 * under /dashboard-employee, rendered inside the phone.
 */
export function EmployeeShell({ children }: { children: ReactNode }) {
  const path = strip(usePathname());
  const screenRef = useRef<HTMLDivElement>(null);

  // Each route starts at the top of the phone screen.
  // Braces matter: some browsers return a Promise from scrollTo, and React would call it as the cleanup.
  useEffect(() => {
    screenRef.current?.scrollTo({ top: 0 });
  }, [path]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_15%_10%,#dde4f1,transparent_60%),radial-gradient(900px_600px_at_90%_90%,#eef3df,transparent_60%),#f1f3f7] pb-10 sm:px-6 sm:pt-[18px]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/90 px-3.5 py-2.5 backdrop-blur sm:static sm:mx-auto sm:mb-[18px] sm:max-w-[1080px] sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex items-center gap-1">
          <Logo size={24} />
          <span className="ml-1 hidden text-[13px] font-medium text-muted sm:inline">Aplikasi karyawan</span>
        </div>
        <Link href={ROUTES.hr.root} title="Buka dashboard HR"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-[7px] text-[13px] font-semibold whitespace-nowrap text-head hover:border-brand-2">
          <Icon name="grid" size={15} />Dashboard HR
        </Link>
      </header>

      <div className="mx-auto grid max-w-[1080px] items-center justify-items-center gap-5 pt-4 sm:gap-7 sm:pt-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:justify-items-stretch lg:gap-14">
        <FlowGuide path={path} />
        <Phone screenRef={screenRef} path={path}>{children}</Phone>
      </div>

      <p className="mx-auto mt-[18px] max-w-[520px] px-4 text-center text-[12.5px] leading-normal text-muted">
        Prototipe dengan data contoh. Jawaban per orang tidak pernah dikirim ke HR. HR hanya melihat rata-rata divisi minimal 5 orang.
      </p>
    </div>
  );
}

function FlowGuide({ path }: { path: string }) {
  const { reset } = useEmployee();
  const router = useRouter();
  return (
    <aside className="order-2 w-full max-w-[520px] px-4 sm:px-0 lg:order-none lg:max-w-none">
      <h2 className="mb-1.5 text-[22px] font-bold sm:text-[28px]">Alur aplikasi karyawan</h2>
      <p className="mb-[18px] text-[14.5px] text-muted">Klik langkah untuk melompat, atau coba langsung di HP.</p>
      <ol className="relative grid max-w-[470px] gap-1.5 before:absolute before:top-6 before:bottom-6 before:left-[25px] before:w-0.5 before:bg-line before:content-['']">
        {FLOW.map((step, i) => {
          const on = activeHref(path, step.href);
          return (
            <li key={step.href}>
              <Link href={step.href} aria-current={on ? "step" : undefined}
                className={cn(
                  "relative grid grid-cols-[30px_1fr] items-center gap-3.5 rounded-2xl border border-transparent px-3 py-2.5 text-ink hover:bg-white/60",
                  on && "border-line bg-white shadow-[0_6px_18px_rgba(0,0,0,.08)] hover:bg-white",
                )}>
                <span className={cn(
                  "z-10 grid size-7 place-items-center rounded-full border-2 text-[13px] font-bold",
                  on ? "border-app bg-app text-white" : "border-line bg-white text-muted",
                )}>{i + 1}</span>
                <span>
                  <b className="block text-[15px]">{step.title}</b>
                  <small className="mt-px block text-[13px] text-muted">{step.text}</small>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-[18px] grid max-w-[470px] gap-0.5 rounded-[14px] bg-white/70 px-3.5 py-3 text-[13px] leading-normal text-body">
        <b>Yang sampai ke HR</b>
        <span>Rata-rata per divisi (minimal 5 orang) untuk 17 area, mood, jam tidur, dan penyebab yang dipilih. Insight pribadi dan jawaban per orang tidak pernah dikirim.</span>
      </div>
      <button type="button" onClick={() => { reset(); router.push(E.root); }}
        className="mt-2.5 py-1 text-[13px] font-semibold text-brand">
        Ulang dari awal
      </button>
    </aside>
  );
}

function Phone({ children, path, screenRef }: { children: ReactNode; path: string; screenRef: React.RefObject<HTMLDivElement | null> }) {
  const fullScreen = isFullScreen(path);
  return (
    <div className="rounded-[46px] bg-[#1d1d1f] p-2 shadow-[0_40px_80px_rgba(0,0,0,.28),inset_0_0_0_2px_#313944] sm:rounded-[54px] sm:p-3">
      <div className="relative flex h-[min(720px,calc(100dvh_-_110px))] min-h-[560px] w-[calc(100vw_-_48px)] max-w-[375px] flex-col overflow-hidden rounded-[38px] bg-white text-ink sm:h-[min(780px,calc(100vh_-_120px))] sm:min-h-[620px] sm:w-[375px] sm:rounded-[42px]">
        <StatusBar />
        <div ref={screenRef} className="relative min-h-0 flex-1 overflow-y-auto scrollbar-none">{children}</div>
        {!fullScreen && <AppNav path={path} />}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="relative flex flex-none items-center justify-between px-7 pt-3.5 pb-1.5 text-sm font-semibold" aria-hidden="true">
      <span>9:41</span>
      <span className="absolute top-[9px] left-1/2 h-7 w-[104px] -translate-x-1/2 rounded-full bg-[#1d1d1f]" />
      <span className="inline-flex items-end gap-0.5">
        {[4, 6, 8, 10].map((h) => <i key={h} className="w-[3px] rounded-[1px] bg-ink" style={{ height: h }} />)}
      </span>
    </div>
  );
}

function AppNav({ path }: { path: string }) {
  return (
    <nav aria-label="Menu aplikasi"
      className="absolute inset-x-2.5 bottom-2.5 z-10 grid h-[70px] grid-cols-4 items-center rounded-3xl bg-[#f2f4f8]/90 px-1 shadow-[0_10px_30px_rgba(0,0,0,.15),inset_0_0_0_1px_rgba(255,255,255,.8)] backdrop-blur-md">
      {APP_NAV.map((item) => {
        const on = within(path, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined}
            className={cn("grid justify-items-center gap-[3px] py-1.5", on ? "text-app-dark" : "text-[#6f7c8e]")}>
            <span className={cn(
              "grid h-[30px] w-11 place-items-center rounded-xl transition-colors",
              on && "bg-app text-white shadow-[0_6px_14px_rgba(8,87,214,.3)]",
            )}>
              <Icon name={item.icon} size={22} />
            </span>
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
