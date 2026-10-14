import { cn } from "@/lib/cn";
import type { Mood } from "../content";

/** Soft rounded tile with a mouth line drawn in the mood's colors. */
export function MoodFace({ mood, size, className }: { mood: Mood; size?: number; className?: string }) {
  // Gradient ids only depend on the mood, so repeated faces share identical definitions.
  const id = `mood-${mood.id}`;
  return (
    <svg viewBox="0 0 56 56" width={size ?? "100%"} height={size ?? "100%"} aria-hidden="true" className={cn("block", className)}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={mood.bg} />
        </linearGradient>
        {/* userSpaceOnUse keeps the gradient visible on the flat "Biasa" line */}
        <linearGradient id={`${id}-st`} gradientUnits="userSpaceOnUse" x1="12" y1="20" x2="44" y2="38">
          <stop offset="0" stopColor={mood.stroke[0]} />
          <stop offset="1" stopColor={mood.stroke[1]} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="54" height="54" rx="16" fill={`url(#${id}-bg)`} />
      <path d={mood.path} fill="none" stroke={`url(#${id}-st)`} strokeWidth="9" strokeLinecap="round" />
      <path d={mood.path} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" transform="translate(0,-2.2)" />
    </svg>
  );
}

export function MoodTile({ mood, selected, onSelect }: { mood: Mood; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={cn("group grid justify-items-center gap-1 text-[10.5px] text-muted", selected && "font-bold text-app-dark")}>
      <MoodFace mood={mood} className={cn(
        "aspect-square rounded-2xl shadow-[0_6px_14px_rgba(0,0,0,.12)] transition-transform",
        selected && "-translate-y-[3px] shadow-[0_0_0_2.5px_var(--color-app),0_10px_18px_rgba(0,0,0,.2)]",
      )} />
      <span>{mood.label}</span>
    </button>
  );
}
