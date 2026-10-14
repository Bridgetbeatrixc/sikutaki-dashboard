import { TREND, TREND_WEEKS, type TrendLine } from "../content";

const PAD = { l: 30, r: 10, t: 12, b: 24 };
const MIN = 30;
const MAX = 70;

/** Weekly area scores on one shared 30 to 70 axis (sample data). */
export function TrendChart({ w = 520, h = 200, lines = TREND, weeks = TREND_WEEKS }: { w?: number; h?: number; lines?: TrendLine[]; weeks?: string[] }) {
  const x = (i: number) => PAD.l + (i * (w - PAD.l - PAD.r)) / (weeks.length - 1);
  const y = (v: number) => PAD.t + ((MAX - v) * (h - PAD.t - PAD.b)) / (MAX - MIN);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" role="img" aria-label="Grafik tren skor per minggu (data contoh)">
      {[30, 40, 50, 60, 70].map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={w - PAD.r} y1={y(v)} y2={y(v)} stroke="#E8E8ED" />
          <text x={PAD.l - 8} y={y(v) + 3} textAnchor="end" className="fill-[#86868b] font-mono text-[10px]">{v}</text>
        </g>
      ))}
      {weeks.map((wk, i) => (i % 2 === 0 || i === weeks.length - 1) && (
        <text key={wk} x={x(i)} y={h - 6} textAnchor="middle" className="fill-[#86868b] font-mono text-[10px]">{wk}</text>
      ))}
      {lines.map((l, li) => {
        const d = l.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
        const last = l.values.length - 1;
        return (
          <g key={l.name}>
            {li === 0 && <path d={`${d} L${x(last)},${y(MIN)} L${x(0)},${y(MIN)} Z`} fill={l.color} opacity={0.08} />}
            <path d={d} fill="none" stroke={l.color} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(last)} cy={y(l.values[last])} r={4} fill="#fff" stroke={l.color} strokeWidth={2.4} />
          </g>
        );
      })}
    </svg>
  );
}

export function TrendLegend() {
  return (
    <span className="flex flex-wrap gap-2.5 text-[11.5px] text-muted">
      {TREND.map((l) => <span key={l.name}><i className="mr-[5px] inline-block size-2 rounded-full" style={{ background: l.color }} />{l.name}</span>)}
    </span>
  );
}
