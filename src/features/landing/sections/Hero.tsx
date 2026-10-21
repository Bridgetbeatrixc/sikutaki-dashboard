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
      "absolute z-[3] hidden animate-bob rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,.14)]",
      block ? "sm:block" : "items-center gap-2.5 sm:flex",
      className,
    )}>
      {children}
    </div>
  );
}

const TRUST = [
  { icon: "lock", text: "Anonim, min. 5 orang per tim" },
  { icon: "clock", text: "3 menit seminggu" },
  { icon: "heart", text: "Bukan alat diagnosis" },
] as const;

/**
 * Stacked and centred on phones and tablets; on desktop (lg+) text sits on the left and the
 * phone + photo composition on the right, sized so the whole hero fits in the first screen.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-[50px] sm:pt-20 sm:pb-[70px] lg:flex lg:min-h-[min(calc(100svh-64px),820px)] lg:items-center lg:py-10">
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-40 hidden size-[760px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#e6effe,rgba(255,255,255,0))] lg:block" />
      <div className={`${container} relative grid justify-items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10`}>
        <div className="grid max-w-[860px] justify-items-center gap-5 text-center lg:max-w-[560px] lg:justify-items-start lg:text-left">
          <span className="text-[17px] font-semibold text-brand sm:text-[19px]">Untuk HR dan tim People</span>
          <h1 className="text-[clamp(44px,7vw,88px)] font-semibold tracking-[-0.035em] lg:text-[clamp(52px,4.9vw,68px)] lg:leading-[1.04]">Tim yang sehat mental, terukur setiap minggu.</h1>
          <p className="max-w-[620px] text-[19px] text-muted sm:text-[23px] sm:leading-snug lg:max-w-[500px] lg:text-[21px]">Check-in 3 menit untuk karyawan. Dashboard anonim untuk HR. 42 area, bukan cuma stres.</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 lg:justify-start">
            <a href="#demo" className={pillButton("primary", true)}>Jadwalkan demo</a>
            <Link href={ROUTES.demo.hr} className={`${textLink} text-[17px]`}>Coba dashboard HR <Icon name="chevron" size={16} /></Link>
          </div>
          <ul className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-[14px] text-muted lg:flex">
            {TRUST.map((t) => (
              <li key={t.text} className="inline-flex items-center gap-1.5"><Icon name={t.icon} size={15} className="text-brand" />{t.text}</li>
            ))}
          </ul>
        </div>

        <div className="mx-auto grid w-full max-w-[680px] justify-items-center gap-4 sm:relative sm:block sm:h-[660px] lg:h-[600px] lg:max-w-[540px] xl:h-[620px]">
          <div className="size-[300px] max-w-full overflow-hidden rounded-full shadow-[0_30px_70px_rgba(0,0,0,.14)] sm:absolute sm:top-5 sm:right-2.5 sm:size-[470px] lg:top-6 lg:right-0 lg:size-[400px] xl:size-[430px]">
            <img src={asset("/img/hero-rina.jpg")} alt="Karyawan tersenyum sambil memegang ponsel" className="size-full object-cover object-[50%_30%]" />
          </div>
          <Link href={ROUTES.demo.employee} aria-label="Buka aplikasi karyawan"
            className="-mt-[90px] block sm:absolute sm:top-[50px] sm:left-0 sm:z-[2] sm:mt-0 lg:top-0 lg:left-2 lg:origin-top-left lg:scale-[.9] xl:scale-[.93]">
            <PhoneMock />
          </Link>
          <Float className="top-0 right-0 lg:-top-2 lg:right-4">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-2 text-white"><Icon name="check" size={14} stroke={2.6} /></span>
            <div><b className="block text-sm font-semibold">Check-in selesai</b><small className="text-xs text-muted">2 menit 40 detik</small></div>
          </Float>
          <Float className="top-[300px] -right-2.5 [animation-delay:-1.5s] lg:top-[290px] lg:-right-4">
            <Ring value={84} size={50} label="84%" />
            <div><b className="block text-sm font-semibold">Partisipasi tim</b><small className="text-xs text-muted">Dashboard HR · contoh</small></div>
          </Float>
          <Float block className="right-10 bottom-10 w-60 [animation-delay:-3s] lg:right-6 lg:bottom-6">
            <ScaleBar label="Tingkat stres" pos={46} value="Sedang" />
          </Float>
        </div>
      </div>
    </section>
  );
}
