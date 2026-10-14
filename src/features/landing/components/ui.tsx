import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared pieces of the landing page. */

export const container = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

type Pill = "primary" | "white";
export function pillButton(variant: Pill = "primary", large = false, className?: string) {
  return cn(
    "inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors",
    large ? "px-7 py-3.5 text-[17px]" : "px-4 py-2 text-sm sm:px-5 sm:text-[15px]",
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-hover"
      : "bg-white text-brand hover:bg-white/90",
    className,
  );
}

export const textLink = "inline-flex items-center gap-1 font-medium text-brand hover:underline underline-offset-4";

export function SectionHead({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-11 grid max-w-[720px] gap-3 text-center">
      <h2 className="text-[clamp(34px,4.6vw,56px)] font-semibold">{title}</h2>
      {text && <p className="text-[19px] text-muted sm:text-[21px]">{text}</p>}
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
  return <div className={cn("rounded-[22px] bg-white shadow-[0_4px_24px_rgba(0,0,0,.08)]", className)}>{children}</div>;
}
