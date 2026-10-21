/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui/Icon";
import { asset, ROUTES } from "@/lib/paths";

const POINTS = ["Check-in 3 menit setiap minggu", "Dashboard anonim, minimal 5 orang per tim", "Rujukan rahasia ke psikolog mitra"];

/** Photo shown beside the form. Temporary photos; see README "Foto masuk/daftar" to replace them. */
export type AuthPhoto = { src: string; alt: string };

/** Split layout for login and sign-up: a human photo with the brand message on the left (desktop), form on the right. */
export function AuthCard({ title, text, photo, children, footer }: { title: string; text: string; photo: AuthPhoto; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <img src={asset(photo.src)} alt={photo.alt} className="absolute inset-0 size-full object-cover object-[50%_35%]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,72,194,.10)_0%,rgba(8,72,194,0)_30%,rgba(8,60,170,.55)_58%,rgba(6,48,140,.92)_100%)]" />
        <Link href={ROUTES.home} className="relative inline-flex items-center gap-2.5 self-start rounded-full bg-white py-1.5 pr-4 pl-2 text-[17px] font-semibold tracking-[-0.02em] text-ink shadow-[0_8px_24px_rgba(0,0,0,.12)]">
          <img src={asset("/logo.png")} alt="" width={28} height={28} />Sikutaki
        </Link>
        <div className="relative mt-auto grid max-w-[460px] gap-6">
          <h2 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.035em] text-white xl:text-[44px]">Kesehatan mental tim, terukur setiap minggu.</h2>
          <ul className="grid gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[16px] text-white/90">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Icon name="check" size={15} stroke={2.6} /></span>{p}
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-white/70">Sikutaki bukan layanan krisis. Dalam keadaan darurat, hubungi 112.</p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-10">
          <Logo size={28} className="text-[19px] lg:invisible" />
          <Link href={ROUTES.home} className="inline-flex items-center gap-1 text-[14px] text-body hover:text-brand">
            <Icon name="back" size={16} />Beranda
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-5 pt-2 pb-16 sm:items-center sm:px-10 sm:pt-0">
          <div className="grid w-full max-w-[420px] gap-7">
            <div className="relative -mb-1 h-36 overflow-hidden rounded-[24px] sm:h-44 lg:hidden">
              <img src={asset(photo.src)} alt={photo.alt} className="size-full object-cover object-[50%_22%]" />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,72,194,0)_45%,rgba(6,48,140,.55)_100%)]" />
              <span className="absolute bottom-3 left-4 text-[13px] font-medium text-white">Check-in 3 menit · anonim untuk HR</span>
            </div>
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
