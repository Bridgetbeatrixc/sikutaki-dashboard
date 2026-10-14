export function Sparkline({ values, color = "#0A66F5", w = 96, h = 28, className }: { values: number[]; color?: string; w?: number; h?: number; className?: string }) {
  const lo = Math.min(...values) - 2, hi = Math.max(...values) + 2;
  const x = (i: number) => 2 + (i * (w - 6)) / (values.length - 1);
  const y = (v: number) => 2 + ((hi - v) * (h - 4)) / (hi - lo || 1);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={className ?? "block"}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={2.8} fill={color} />
    </svg>
  );
}
