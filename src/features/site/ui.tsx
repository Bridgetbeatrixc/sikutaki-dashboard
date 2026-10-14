import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { container } from "@/features/landing/components/ui";

/* Building blocks for the company pages (about, pricing, security, contact, legal). */

export function PageIntro({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="bg-white pt-14 pb-12 sm:pt-24 sm:pb-16">
      <div className={`${container} grid max-w-[880px] justify-items-center gap-5 text-center`}>
        <span className="text-[17px] font-semibold text-brand">{eyebrow}</span>
        <h1 className="text-[clamp(38px,6vw,72px)] font-semibold tracking-[-0.03em]">{title}</h1>
        {text && <p className="max-w-[640px] text-[19px] text-muted sm:text-[21px] sm:leading-snug">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function Band({ tone = "white", className, children }: { tone?: "white" | "grey"; className?: string; children: ReactNode }) {
  return (
    <section className={cn(tone === "grey" ? "bg-canvas" : "bg-white", "py-14 sm:py-20", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function BandHead({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 grid max-w-[720px] gap-3 text-center">
      <h2 className="text-[clamp(30px,4vw,44px)] font-semibold">{title}</h2>
      {text && <p className="text-[17px] text-muted sm:text-[19px]">{text}</p>}
    </div>
  );
}

/** Rounded tile with an icon, a title and a short text. */
export function Tile({ icon, title, children, className }: { icon: IconName; title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-2.5 rounded-[22px] bg-white p-6 sm:p-7", className)}>
      <span className="inline-flex size-11 items-center justify-center rounded-[14px] bg-mint text-brand"><Icon name={icon} size={22} /></span>
      <b className="text-[19px] font-semibold text-ink">{title}</b>
      <div className="text-[15px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}

/** Small "prototype" tag so visitors never mistake demo content for a live service. */
export function ProtoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-2xl bg-warn-bg px-4 py-3 text-left text-[13.5px] text-warn", className)}>
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
