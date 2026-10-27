import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Shown instead of a number when fewer than 5 people answered. */
export function HiddenNote({ text = "Disembunyikan, kurang dari 5 orang", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("bg-hatch flex items-center gap-2 rounded-[10px] px-3 py-2 text-[15px] text-muted", className)}>
      <Icon name="lock" size={16} />{text}
    </div>
  );
}
