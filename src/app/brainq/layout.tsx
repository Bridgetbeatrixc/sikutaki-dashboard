import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "BrainQ Workforce", template: "%s · BrainQ Workforce" },
  description: "Dashboard BrainQ Workforce: kesiapan kognitif tim dari hasil scan anonim, tanpa data pribadi.",
};

export default function BrainQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bq-bg font-[family-name:var(--font-manrope)] text-bq-ink">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <header className="sticky top-0 z-20 border-b border-bq-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/brainq" className="flex items-baseline gap-1.5 text-[17px] font-extrabold tracking-tight text-bq-plum">
            <span>Brain<span className="text-bq-purple">Q</span></span>
            <span className="text-[13px] font-semibold text-bq-ink-3">Workforce</span>
          </Link>
          <nav className="flex items-center gap-1 text-[13.5px] font-semibold">
            <Link href="/brainq" className="rounded-full px-3 py-1.5 text-bq-ink-2 hover:bg-bq-mist hover:text-bq-ink">Dashboard</Link>
            <Link href="/brainq/scan" className="rounded-full px-3 py-1.5 text-bq-ink-2 hover:bg-bq-mist hover:text-bq-ink">Scan<span className="hidden sm:inline"> karyawan</span></Link>
            <a href="https://sikutaki-brainq.vercel.app" className="hidden rounded-full px-3 py-1.5 text-bq-ink-2 hover:bg-bq-mist hover:text-bq-ink sm:inline">Situs BrainQ</a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mx-auto max-w-6xl px-4 pt-6 pb-10 text-[12.5px] leading-relaxed text-bq-ink-3 sm:px-6">
        BrainQ adalah sistem cognitive wellness &amp; performance, bukan alat diagnosis. © 2026 SIKUTAKI.
      </footer>
    </div>
  );
}
