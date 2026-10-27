import { Dot } from "@/components/ui/Chip";

export type BarItem = { id: string; label: string; color: string; v: number; ref?: number };

/** Horizontal 0-100 bars; the dark tick marks the company average. */
export function CompareBars({ items, onSelect }: { items: BarItem[]; onSelect?: (id: string) => void }) {
  return (
    <div className="grid gap-1">
      {items.map((it) => (
        <button key={it.id} type="button" onClick={() => onSelect?.(it.id)}
          className="grid grid-cols-[104px_1fr_26px] items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-canvas sm:grid-cols-[130px_1fr_30px]">
          <span className="inline-flex min-w-0 items-center gap-2 text-[15.5px] font-medium"><Dot color={it.color} />{it.label}</span>
          <span className="relative block h-2.5 rounded-full bg-track">
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${it.v}%`, background: it.color }} />
            {it.ref !== undefined && <span className="absolute -top-1 -ml-px h-[18px] w-0.5 rounded-sm bg-ink" style={{ left: `${it.ref}%` }} title={`Rata-rata perusahaan ${it.ref}`} />}
          </span>
          <b className="num text-right text-[15.5px]">{it.v}</b>
        </button>
      ))}
    </div>
  );
}
