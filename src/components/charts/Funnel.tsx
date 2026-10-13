/** Steps from sent to completed, with the conversion rate between steps. */
export function Funnel({ steps }: { steps: { label: string; v: number }[] }) {
  const max = steps[0].v;
  return (
    <div className="grid gap-2.5">
      {steps.map((s, i) => (
        <div key={s.label} className="grid grid-cols-[70px_1fr_48px_42px] items-center gap-2.5">
          <span>{s.label}</span>
          <span className="block h-[26px] overflow-hidden rounded-lg bg-track"><span className="block h-full rounded-lg bg-[#2f6bd8]" style={{ width: `${(s.v / max) * 100}%` }} /></span>
          <b className="num text-right">{s.v}</b>
          <em className="num text-xs text-muted not-italic">{i ? `${Math.round((s.v / steps[i - 1].v) * 100)}%` : ""}</em>
        </div>
      ))}
    </div>
  );
}
