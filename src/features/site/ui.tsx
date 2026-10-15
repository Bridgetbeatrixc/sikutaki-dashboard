import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { container } from "@/features/landing/components/ui";

/* Building blocks for the company pages: one hero, bands, cards and a closing call to action. */

/** Blue rounded tile with a white icon, in the gradient of the Sikutaki logo. */
export function GradientIcon({ name, size = "md", className }: { name: IconName; size?: "md" | "lg"; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center bg-[linear-gradient(145deg,#6cb8fa,var(--color-brand))] text-white shadow-[0_8px_20px_rgba(10,102,245,.25)]",
      size === "lg" ? "size-16 rounded-[20px]" : "size-11 rounded-[14px]", className)}>
      <Icon name={name} size={size === "lg" ? 30 : 22} stroke={2} />
    </span>
  );
}

export function PageHero({ icon, eyebrow, title, text, children }: { icon: IconName; eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#e3eefe,rgba(255,255,255,0))]" />
      <div className={`${container} relative grid max-w-[900px] justify-items-center gap-5 pt-14 pb-14 text-center sm:pt-24 sm:pb-20`}>
        <GradientIcon name={icon} size="lg" />
        <span className="text-[15px] font-semibold tracking-wide text-brand uppercase">{eyebrow}</span>
        <h1 className="text-[clamp(38px,6.2vw,76px)] font-semibold tracking-[-0.035em]">{title}</h1>
        {text && <p className="max-w-[660px] text-[19px] text-muted sm:text-[22px] sm:leading-snug">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function Band({ tone = "white", className, children }: { tone?: "white" | "grey"; className?: string; children: ReactNode }) {
  return (
    <section className={cn(tone === "grey" ? "bg-canvas" : "bg-white", "py-16 sm:py-24", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function BandHead({ eyebrow, title, text, align = "center" }: { eyebrow?: string; title: string; text?: string; align?: "center" | "left" }) {
  return (
    <div className={cn("mb-10 grid max-w-[720px] gap-3 sm:mb-14", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && <span className="text-[15px] font-semibold text-brand">{eyebrow}</span>}
      <h2 className="text-[clamp(30px,4.4vw,52px)] font-semibold tracking-[-0.03em]">{title}</h2>
      {text && <p className="text-[17px] text-muted sm:text-[20px]">{text}</p>}
    </div>
  );
}

/** White card with a gradient icon, a title and a short text. */
export function FeatureCard({ icon, title, children, className }: { icon: IconName; title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-4 rounded-[28px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,.04)] transition-transform duration-300 hover:-translate-y-1 sm:p-8", className)}>
      <GradientIcon name={icon} />
      <b className="text-[21px] font-semibold tracking-[-0.01em] text-ink">{title}</b>
      <div className="text-[16px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}

/** Closing blue panel with a title, a line of text and up to two links. */
export function CtaBand({ title, text, primary, secondary }: {
  title: string; text: string; primary: { label: string; href: string }; secondary?: { label: string; href: string };
}) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className={container}>
        <div className="relative grid justify-items-center gap-5 overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#5ab0f7_0%,var(--color-brand)_60%,#0848c2_100%)] px-6 py-14 text-center text-white sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-white/10" />
          <h2 className="relative max-w-[680px] text-[clamp(30px,4.4vw,52px)] font-semibold tracking-[-0.03em] text-white">{title}</h2>
          <p className="relative max-w-[560px] text-[17px] text-white/85 sm:text-[19px]">{text}</p>
          <div className="relative mt-2 flex flex-wrap justify-center gap-3">
            <Link href={primary.href} className="rounded-full bg-white px-7 py-3.5 text-[17px] font-medium text-brand hover:bg-white/90">{primary.label}</Link>
            {secondary && (
              <Link href={secondary.href} className="rounded-full px-7 py-3.5 text-[17px] font-medium text-white ring-1 ring-white/60 hover:bg-white/10">{secondary.label}</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small "prototype" tag so visitors never mistake demo content for a live service. */
export function ProtoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("inline-flex items-start gap-2 rounded-2xl bg-warn-bg px-4 py-3 text-left text-[13.5px] text-warn", className)}>
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
