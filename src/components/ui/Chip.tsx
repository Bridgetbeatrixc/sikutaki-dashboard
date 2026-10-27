import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, type Status } from "@/lib/catalog";
import { Icon, type IconName } from "./Icon";

const STATUS_STYLE: Record<Status, { cls: string; icon: IconName }> = {
  baik: { cls: "bg-good-bg text-good", icon: "check" },
  waspada: { cls: "bg-warn-bg text-warn", icon: "info" },
  perhatian: { cls: "bg-bad-bg text-bad", icon: "alert" },
};

/** Status is always icon + label + color, never color alone. */
export function StatusChip({ s, small = false }: { s: Status; small?: boolean }) {
  const st = STATUS_STYLE[s];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold", st.cls, small ? "py-0.5 pr-2 pl-1.5 text-[14px]" : "py-[3px] pr-2.5 pl-2 text-[15px]")}>
      <Icon name={st.icon} size={small ? 12 : 14} stroke={2.2} />
      {STATUS_LABEL[s]}
    </span>
  );
}

type Tone = "neutral" | "good" | "warn" | "info" | "sand" | "brand";
const TONE: Record<Tone, string> = {
  neutral: "bg-[#edeff4] text-muted",
  good: "bg-good-bg text-good",
  warn: "bg-warn-bg text-warn",
  info: "bg-info-bg text-info",
  sand: "bg-sand-bg text-sand",
  brand: "bg-mint text-brand",
};

export function Tag({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[14px] font-semibold", TONE[tone], className)}>{children}</span>;
}

/** Colored dot used next to an area name; the color is the area's group. */
export function Dot({ color, className }: { color: string; className?: string }) {
  return <i className={cn("inline-block size-2 shrink-0 rounded-full", className)} style={{ background: color }} />;
}
