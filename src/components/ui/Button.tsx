import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "soft" | "link";
type Size = "md" | "sm";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover disabled:opacity-45",
  soft: "border border-[#cfd8e3] bg-mint text-brand hover:border-brand-2",
  link: "p-0! text-brand hover:underline underline-offset-4",
};
const SIZE: Record<Size, string> = {
  md: "px-4 py-2 rounded-xl",
  sm: "px-3 py-1.5 text-[15px] rounded-[10px]",
};
const base = "inline-flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variant !== "link" && SIZE[size], VARIANT[variant], className);
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", size = "md", className, children }: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode }) {
  return <Link href={href} className={buttonClass(variant, size, className)}>{children}</Link>;
}
