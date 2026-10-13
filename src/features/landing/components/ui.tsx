import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared pieces of the landing page. */

export const container = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

type Pill = "primary" | "white";
export function pillButton(variant: Pill = "primary", large = false, className?: string) {
  return cn(
    "inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow] hover:-translate-y-px",
    large ? "px-7 py-3.5 text-base" : "px-4 py-2.5 text-sm sm:px-[22px] sm:py-[11px] sm:text-[15px]",
    variant === "primary"
      ? "bg-[linear-gradient(135deg,var(--color-brand-2),var(--color-brand))] text-white shadow-[0_8px_20px_rgba(11,107,79,.22)] hover:shadow-[0_12px_26px_rgba(11,107,79,.28)]"
      : "bg-white text-brand",
    className,
  );
}

export const textLink = "inline-flex items-center gap-1.5 font-semibold text-brand";

export function SectionHead({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-11 grid max-w-[720px] gap-3 text-center">
      <h2 className="text-[clamp(32px,4vw,48px)] font-light">{title}</h2>
      {text && <p className="text-[17px] text-muted">{text}</p>}
    </div>
  );
}

/** Footnote marker pointing to the source list in the footer. */
export function Ref({ n }: { n: number }) {
  return <a href="#sumber" className="align-super text-[.78em] font-semibold text-brand">[{n}]</a>;
}

export function Track({ value, color, className }: { value: number; color: string; className?: string }) {
  return (
    <span className={cn("block h-2 overflow-hidden rounded-full bg-track", className)}>
      <span className="block h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </span>
  );
}

/** Label, track and value in one row. */
export function BarRow({ label, value, color, labelWidth = 96 }: { label: string; value: number; color: string; labelWidth?: number }) {
  return (
    <div className="grid items-center gap-2.5 text-[12.5px]" style={{ gridTemplateColumns: `${labelWidth}px 1fr 26px` }}>
      <span>{label}</span>
      <Track value={value} color={color} />
      <b className="num text-right font-semibold">{value}</b>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white shadow-[0_16px_36px_rgba(14,42,35,.12)]", className)}>{children}</div>;
}
