import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Change since an earlier week. For symptom areas up is worse; pass goodWhenUp for wellbeing, participation and sleep. */
export function Delta({ d, goodWhenUp = false, unit = "" }: { d: number; goodWhenUp?: boolean; unit?: string }) {
  if (d === 0) return <span className="text-[15px] font-medium text-muted">stabil</span>;
  const good = goodWhenUp ? d > 0 : d < 0;
  return (
    <span className={cn("num inline-flex items-center gap-px text-[15px] font-bold", good ? "text-good" : "text-bad")}>
      <Icon name={d > 0 ? "up" : "down"} size={12} stroke={2.4} />
      {Math.abs(d)}{unit}
    </span>
  );
}
