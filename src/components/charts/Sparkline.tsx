/** Small trend line; nulls (weeks without a result) break the line. */
export function Sparkline({ values, color = "#0A66F5", w = 96, h = 28, className }: { values: (number | null)[]; color?: string; w?: number; h?: number; className?: string }) {
  const known = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (known.length === 0) return <svg width={w} height={h} aria-hidden="true" className={className ?? "block"} />;
  const lo = Math.min(...known.map((p) => p.v)) - 2, hi = Math.max(...known.map((p) => p.v)) + 2;
  const x = (i: number) => 2 + (i * (w - 6)) / Math.max(1, values.length - 1);
  const y = (v: number) => 2 + ((hi - v) * (h - 4)) / (hi - lo || 1);
  let d = "";
  known.forEach((p, k) => { d += `${k && known[k - 1].i === p.i - 1 ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`; });
  const last = known[known.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={className ?? "block"}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {known.filter((p, k) => known.length > 1 && p !== last && known[k - 1]?.i !== p.i - 1 && known[k + 1]?.i !== p.i + 1).map((p) => (
        <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r={1.8} fill={color} />
      ))}
      <circle cx={x(last.i)} cy={y(last.v)} r={2.8} fill={color} />
    </svg>
  );
}
