/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { PhoneMock } from "../components/PhoneMock";
import { Ring } from "../components/Ring";
import { ScaleBar } from "../components/ScaleBar";
import { container, pillButton, textLink } from "../components/ui";

/** Floating card around the hero photo; hidden on phones to keep the hero short. */
function Float({ className, block = false, children }: { className: string; block?: boolean; children: ReactNode }) {
  return (
    <div className={cn(
      "absolute z-[3] hidden animate-bob rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_rgba(14,42,35,.14)]",
      block ? "sm:block" : "items-center gap-2.5 sm:flex",
      className,
    )}>
      {children}
    </div>
  );
}

export function Hero() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#e9f6f1_0%,#eef7fb_55%,#fff_100%)] pt-6 pb-[50px] sm:pt-10 sm:pb-[70px]">
      <div className={`${container} grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]`}>
        <div className="grid gap-[22px]">
          <span className="font-mono text-[13px] tracking-[.06em] text-brand uppercase">Untuk HR dan tim People</span>
          <h1 className="text-[clamp(42px,5.6vw,72px)] font-light">Tim yang sehat mental, terukur setiap minggu.</h1>
          <p className="max-w-[470px] text-[17px] text-muted sm:text-[19px]">Check-in 3 menit untuk karyawan. Dashboard anonim untuk HR. 17 area, bukan cuma stres.</p>
          <div className="flex flex-wrap items-center gap-[18px]">
            <a href="#demo" className={pillButton("primary", true)}>Jadwalkan demo</a>
            <Link href={ROUTES.hr.root} className={textLink}>Coba dashboard HR <Icon name="arrow" size={16} /></Link>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[600px] justify-items-center gap-4 pt-2.5 sm:relative sm:block sm:h-[660px] sm:pt-0 lg:max-w-none">
          <div className="size-[300px] max-w-full overflow-hidden rounded-full shadow-[0_30px_70px_rgba(14,42,35,.18)] sm:absolute sm:top-5 sm:right-2.5 sm:size-[470px]">
            <img src={asset("/img/hero-rina.jpg")} alt="Karyawan tersenyum sambil memegang ponsel" className="size-full object-cover object-[50%_30%]" />
          </div>
          <Link href={ROUTES.employee.root} aria-label="Buka aplikasi karyawan" className="-mt-[90px] block sm:absolute sm:top-[50px] sm:left-0 sm:z-[2] sm:mt-0">
            <PhoneMock />
          </Link>
          <Float className="top-0 right-0">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-2 text-white"><Icon name="check" size={14} stroke={2.6} /></span>
            <div><b className="block text-sm font-semibold">Check-in selesai</b><small className="text-xs text-muted">2 menit 40 detik</small></div>
          </Float>
          <Float className="top-[300px] -right-2.5 [animation-delay:-1.5s]">
            <Ring value={84} size={50} label="84%" />
            <div><b className="block text-sm font-semibold">Partisipasi tim</b><small className="text-xs text-muted">Dashboard HR · contoh</small></div>
          </Float>
          <Float block className="right-10 bottom-10 w-60 [animation-delay:-3s]">
            <ScaleBar label="Tingkat stres" pos={46} value="Sedang" />
          </Float>
        </div>
      </div>
    </section>
  );
}
