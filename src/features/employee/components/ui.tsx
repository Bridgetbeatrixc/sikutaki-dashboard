import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/* Small building blocks shared by the screens of the employee app. */

type Variant = "primary" | "ghost";

export function appButton(variant: Variant = "primary", small = false, className?: string) {
  return cn(
    "mt-2 grid w-full place-items-center font-semibold transition-colors disabled:opacity-50",
    small ? "rounded-[13px] p-[11px] text-sm" : "rounded-2xl p-3.5 text-[15px]",
    variant === "primary" ? "bg-app text-white hover:bg-app-dark" : "bg-soft text-app-dark",
    className,
  );
}

export const linkText = "font-bold text-app underline underline-offset-2";

/** Page body; on phones the bottom padding keeps content clear of the floating tab bar. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-[22px] pt-3.5 pb-[104px] md:px-8 md:pt-6 md:pb-12 lg:px-10", className)}>{children}</div>;
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn("mt-2.5 mb-2 text-[26px] font-semibold text-ink", className)}>{children}</h1>;
}

export function Section({ children }: { children: ReactNode }) {
  return <h3 className="mt-5 mb-2.5 text-[15px] font-bold text-ink">{children}</h3>;
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mb-1.5 text-sm leading-relaxed text-body", className)}>{children}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <small className="mt-2 block text-xs leading-snug text-muted">{children}</small>;
}

/** Top bar of full-screen flows: a close button, a centered title and an optional right slot. */
export function FlowBar({ closeHref, title, right }: { closeHref: string; title: string; right?: ReactNode }) {
  return (
    <div className="grid grid-cols-[40px_1fr_40px] items-center text-center text-[15px] font-semibold">
      <Link href={closeHref} aria-label="Tutup" className="grid size-10 place-items-center rounded-full bg-soft text-ink">
        <Icon name="x" size={18} />
      </Link>
      <span>{title}</span>
      <span className="text-[13px] font-normal text-muted">{right}</span>
    </div>
  );
}

export function CheckCircle({ on }: { on: boolean }) {
  return (
    <span aria-label={on ? "Selesai" : "Belum"}
      className={cn("grid size-7 shrink-0 place-items-center rounded-full text-white", on ? "bg-app" : "bg-white shadow-[inset_0_0_0_1.5px_#c3cbd6]")}>
      {on && <Icon name="check" size={14} />}
    </span>
  );
}

export function StartPill() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-app py-1.5 pr-2 pl-3 text-[12.5px] font-bold text-white">
      Mulai<Icon name="chevron" size={14} />
    </span>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={cn("shrink-0 rounded-full px-3.5 py-[9px] text-[13px] font-medium", on ? "bg-app text-white" : "bg-soft text-body")}>
      {children}
    </button>
  );
}
