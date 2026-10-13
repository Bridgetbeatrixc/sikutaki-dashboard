import { HiddenNote } from "@/components/ui/HiddenNote";
import { Delta } from "@/components/ui/Delta";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/cn";
import { areaById, areaSeries, groupOf } from "@/lib/data";
import { causeShares, type Focus } from "@/lib/focus";

const REASON: Record<Focus["reason"], { label: string; cls: string }> = {
  naik: { label: "Naik cepat", cls: "text-bad" },
  tinggi: { label: "Level tinggi", cls: "text-bad" },
  waspada: { label: "Waspada", cls: "text-warn" },
};

/** One focus area of a division: score, what employees say causes it, and step ideas HR can turn into a note. */
export function FocusCard({ team, focus, onIdea }: { team: string; focus: Focus; onIdea: (text: string, area: string) => void }) {
  const area = areaById(focus.area), group = groupOf(area.group);
  const shares = causeShares(team, focus.area);
  return (
    <article className="grid gap-3.5 rounded-card border border-l-4 border-line bg-white px-5 py-[18px]" style={{ borderLeftColor: group.color }}>
      <header className="flex flex-col items-start justify-between gap-[18px] sm:flex-row">
        <div>
          <span className={cn("text-[11px] font-extrabold tracking-wider uppercase", REASON[focus.reason].cls)}>{REASON[focus.reason].label}</span>
          <h3 className="mt-1 mb-0.5 text-lg font-bold">{area.name}</h3>
          <small className="block max-w-xl text-[12.5px] text-muted">{area.desc}</small>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <b className="num text-[32px] font-bold text-head">{focus.v}</b>
          <Delta d={focus.d} />
          <Sparkline values={areaSeries(team, focus.area)} color={group.color} w={110} h={30} />
        </div>
      </header>
      <div className="grid gap-6 border-t border-line pt-3.5 xl:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-2">
          <span className="text-xs font-bold tracking-wider text-muted uppercase">Penyebab menurut karyawan</span>
          {shares.n < 5 ? <HiddenNote text="Kurang dari 5 orang menjawab" /> : (
            <ul className="grid gap-2.5">
              {shares.rows.slice(0, 4).map((row, i) => (
                <li key={row.cause.id} className="grid grid-cols-[1fr_40px] items-center gap-x-2.5 gap-y-1 text-[13px] sm:grid-cols-[minmax(140px,220px)_1fr_40px]">
                  <span className={cn(i === 0 && "font-bold")}>{row.cause.label}</span>
                  <span className="col-span-2 row-start-2 h-2.5 overflow-hidden rounded-full bg-track sm:col-span-1 sm:row-start-auto">
                    <i className={cn("block h-full rounded-full", i === 0 ? "bg-brand" : "bg-[#9fb9ae]")} style={{ width: `${row.pct}%` }} />
                  </span>
                  <b className="num text-right">{row.pct}%</b>
                </li>
              ))}
            </ul>
          )}
          <small className="text-xs text-muted">&ldquo;{shares.question}&rdquo; Dijawab {shares.n} orang, boleh pilih lebih dari satu.</small>
        </div>
        <div className="grid content-start gap-2">
          <span className="text-xs font-bold tracking-wider text-muted uppercase">Ide langkah</span>
          <ul className="grid gap-2.5">
            {shares.rows.slice(0, 2).map((row) => (
              <li key={row.cause.id} className="grid gap-1 rounded-[10px] bg-[#f6faf8] px-3 py-2.5 text-[13.5px]">
                <span>{row.cause.idea}</span>
                <button type="button" onClick={() => onIdea(row.cause.idea, focus.area)} className="justify-self-start text-[12.5px] font-semibold text-brand hover:underline">Jadikan catatan</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
