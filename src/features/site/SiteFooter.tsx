import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ROUTES } from "@/lib/paths";
import { container } from "@/features/landing/components/ui";
import { DEMO_EMAIL } from "@/features/landing/content";
import { FOOTER_COLUMNS } from "./nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas pt-12 pb-9 text-[13.5px]">
      <div className={`${container} grid grid-cols-2 gap-8 sm:grid-cols-[1.6fr_repeat(4,1fr)]`}>
        <div className="col-span-full grid content-start gap-3 sm:col-span-1">
          <Logo size={28} className="text-[19px]" />
          <a href={`mailto:${DEMO_EMAIL}`} className="text-muted hover:text-brand">{DEMO_EMAIL}</a>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <b className="mb-3 block font-semibold text-ink">{col.title}</b>
            {col.links.map((l) => <Link key={l.label} href={l.href} className="mb-2 block text-muted hover:text-brand">{l.label}</Link>)}
          </div>
        ))}
      </div>
      <div className={`${container} mt-10 grid gap-2.5 border-t border-line pt-6 text-[12.5px] text-muted`}>
        <p>
          Sikutaki adalah alat skrining dan pemantauan kesehatan mental, bukan alat diagnosis medis, dan tidak menggantikan psikolog atau psikiater.
          Butuh bantuan sekarang? Hubungi Healing119 (telepon 119 ekstensi 8). Dalam keadaan darurat, hubungi 112.{" "}
          <Link href={ROUTES.security} className="text-brand hover:underline">Cara kami menjaga data</Link>
        </p>
        <p>Foto orang dari Pexels.</p>
        <p>© 2026 Sikutaki</p>
      </div>
    </footer>
  );
}
