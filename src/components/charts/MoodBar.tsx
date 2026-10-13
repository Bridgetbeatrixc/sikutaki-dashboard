import { MOODS } from "@/lib/focus";

/** Diverging mood colors, shared with the employee app's mood tiles. */
export const MOOD_COLORS = ["#B5533C", "#E3A08E", "#CBD5D1", "#8CC5AE", "#2E8A68"];

export function MoodBar({ pct }: { pct: number[] }) {
  return (
    <div className="grid gap-3">
      <div className="flex h-[18px] gap-0.5 overflow-hidden rounded-md" role="img" aria-label={MOODS.map((m, i) => `${m} ${pct[i]}%`).join(", ")}>
        {pct.map((p, i) => <span key={i} className="block h-full" style={{ width: `${p}%`, background: MOOD_COLORS[i] }} title={`${MOODS[i]} ${p}%`} />)}
      </div>
      <ul className="grid gap-[7px]">
        {MOODS.map((m, i) => (
          <li key={m} className="grid grid-cols-[12px_1fr_auto] items-center gap-2 text-[13px]">
            <i className="size-2.5 rounded-[3px]" style={{ background: MOOD_COLORS[i] }} />{m}<b className="num">{pct[i]}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
