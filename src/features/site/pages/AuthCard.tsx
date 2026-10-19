/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { asset, ROUTES } from "@/lib/paths";

const POINTS = ["Check-in 3 menit setiap minggu", "Dashboard anonim, minimal 5 orang per tim", "Rujukan rahasia ke psikolog mitra"];

/** Split layout for login and sign-up: brand panel on the left (desktop), form on the right. */
export function AuthCard({ title, text, children, footer }: { title: string; text: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#5ab0f7_0%,var(--color-brand)_55%,#0848c2_100%)] p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 size-[420px] rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[380px] rounded-full bg-white/10" />
        <Link href={ROUTES.home} className="relative inline-flex items-center gap-2.5 self-start rounded-full bg-white py-1.5 pr-4 pl-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">
          <img src={asset("/logo.png")} alt="" width={28} height={28} />Sikutaki
        </Link>
        <div className="relative my-auto grid max-w-[460px] gap-8">
          <h2 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.035em] text-white">Kesehatan mental tim, terukur setiap minggu.</h2>
          <ul className="grid gap-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[17px] text-white/90">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/20"><Icon name="check" size={15} stroke={2.6} /></span>{p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[13px] text-white/70">Sikutaki bukan layanan krisis. Dalam keadaan darurat, hubungi 112.</p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-10">
          <Logo size={28} className="text-[19px] lg:invisible" />
          <Link href={ROUTES.home} className="inline-flex items-center gap-1 text-[14px] text-body hover:text-brand">
            <Icon name="back" size={16} />Beranda
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-5 pt-6 pb-16 sm:items-center sm:px-10 sm:pt-0">
          <div className="grid w-full max-w-[420px] gap-7">
            <div className="grid gap-2">
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] sm:text-[40px]">{title}</h1>
              <p className="text-[17px] text-muted">{text}</p>
            </div>
            {children}
            <div className="border-t border-line pt-6 text-[15px] text-muted">{footer}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
