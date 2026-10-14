import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { ROUTES } from "@/lib/paths";

/** Centered card used by the login and sign-up pages. */
export function AuthCard({ title, text, children, footer }: { title: string; text: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between px-4 sm:h-[60px] sm:px-8">
        <Logo size={28} className="text-[19px]" />
        <Link href={ROUTES.home} className="text-[14px] text-body hover:text-brand">Kembali ke beranda</Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="grid w-full max-w-[440px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-[32px] font-semibold sm:text-[40px]">{title}</h1>
            <p className="text-[17px] text-muted">{text}</p>
          </div>
          <div className="grid gap-5 rounded-[28px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,.06)] sm:p-8">{children}</div>
          <div className="text-center text-[14px] text-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
}
