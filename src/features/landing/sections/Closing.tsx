/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { asset, ROUTES } from "@/lib/paths";
import { Ring } from "../components/Ring";
import { container, pillButton } from "../components/ui";
import { DEMO_EMAIL } from "../content";

/** "Try it yourself" banner that opens both dashboards. */
export function TryIt() {
  return (
    <section className={container}>
      <div className="flex flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#5ab0f7,var(--color-brand))] text-white sm:flex-row">
        <div className="grid shrink-0 place-items-center bg-white/10 p-6 sm:w-[200px] sm:p-0">
          <Ring value={84} size={92} color="#ffffff" track="rgba(255,255,255,.25)" textColor="#ffffff" label="84%" />
        </div>
        <div className="grid justify-items-start gap-3 px-[22px] py-[26px] sm:px-9 sm:py-[34px]">
          <h3 className="text-[32px] font-semibold text-white">Coba langsung</h3>
          <p className="max-w-[520px] text-white/85">Buka demo dashboard HR dan aplikasi karyawan dengan perusahaan contoh, tanpa membuat akun.</p>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.demo.hr} className={pillButton("white")}>Dashboard HR</Link>
            <Link href={ROUTES.demo.employee} className="inline-flex items-center rounded-full border border-white/60 px-[22px] py-[11px] text-[15px] font-medium text-white hover:bg-white/10">
              Aplikasi karyawan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="demo" className="relative mt-[90px] flex min-h-[460px] items-center overflow-hidden sm:min-h-[520px]">
      <img src={asset("/img/final-team.jpg")} alt="Tim kerja sedang berdiskusi di kantor" className="absolute inset-0 size-full max-w-none object-cover object-[50%_40%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.55)_45%,rgba(0,0,0,.1)_100%)]" />
      <div className={`${container} relative grid gap-4 py-[60px] sm:py-[90px]`}>
        <h2 className="text-[clamp(38px,5vw,64px)] font-semibold text-white">Mulai dari satu tim dulu.</h2>
        <p className="text-[19px] text-white/85">Pilot 3 bulan, laporan transparan di akhir.</p>
        <div className="flex flex-wrap items-center gap-[18px]">
          <a href={`mailto:${DEMO_EMAIL}`} className={pillButton("primary", true)}>Jadwalkan demo</a>
          <span className="font-mono text-sm text-white select-all">{DEMO_EMAIL}</span>
        </div>
      </div>
    </section>
  );
}
