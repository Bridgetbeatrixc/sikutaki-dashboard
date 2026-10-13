"use client";
import { useEffect, useRef, useState } from "react";

const GRID = "#E7EEEB", AXIS = "#8A9B95", INK = "#14231D";
const axisText = "fill-[#8a9b95] font-mono text-[10.5px]";

export type Series = { name: string; color: string; values: number[] };
export type Marker = { i: number; label: string };

/** Single-axis line chart with a crosshair tooltip, dashed event markers and direct end labels. */
export function LineChart({ series, labels, min = 0, max = 100, height = 220, markers = [], unit = "", band }: {
  series: Series[]; labels: string[]; min?: number; max?: number; height?: number;
  markers?: Marker[]; unit?: string; band?: { from: number; to: number };
}) {
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = height, pt = 18, pb = 26, pl = 34;
  const pr = series.length > 1 ? Math.min(130, Math.max(...series.map((s) => s.name.length)) * 6.6 + 18) : 20;
  const n = labels.length;
  const x = (i: number) => pl + (i * (W - pl - pr)) / (n - 1);
  const y = (v: number) => pt + ((max - v) * (H - pt - pb)) / (max - min);
  const ticks = Array.from({ length: 5 }, (_, k) => Math.round(min + ((max - min) * k) / 4));
  const narrow = W < 560;

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - pl) / (W - pl - pr)) * (n - 1)))));
  };

  return (
    <div className="relative" ref={box}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={series.map((s) => s.name).join(", ")}>
        {band && <rect x={pl} width={W - pl - pr} y={y(band.to)} height={y(band.from) - y(band.to)} fill="#F2F7F5" />}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={pl - 8} y={y(t) + 3.5} textAnchor="end" className={axisText}>{t}</text>
          </g>
        ))}
        {labels.map((l, i) => (W < 480 ? i % 3 === 2 : i % 2 === 1 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className={axisText}>{l}</text>
        ))}
        {markers.map((m, k) => (
          <g key={`${m.label}-${k}`}>
            <line x1={x(m.i)} x2={x(m.i)} y1={pt - 6} y2={H - pb} stroke={AXIS} strokeDasharray="3 4" />
            {narrow ? (
              <g>
                <circle cx={x(m.i)} cy={pt - 6} r={8} fill="#fff" stroke={AXIS} />
                <text x={x(m.i)} y={pt - 2.5} textAnchor="middle" className="fill-muted text-[11px] font-semibold">{k + 1}</text>
              </g>
            ) : (
              <text x={x(m.i) + (x(m.i) > W * 0.6 ? -6 : 6)} y={pt + 2} textAnchor={x(m.i) > W * 0.6 ? "end" : "start"} className="fill-muted text-[11px] font-semibold">{m.label}</text>
            )}
          </g>
        ))}
        {series.map((s) => {
          const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
          const last = s.values.length - 1;
          return (
            <g key={s.name}>
              {series.length === 1 && <path d={`${d}L${x(last)},${y(min)}L${x(0)},${y(min)}Z`} fill={s.color} opacity={0.07} />}
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={x(last)} cy={y(s.values[last])} r={4.5} fill={s.color} stroke="#fff" strokeWidth={2} />
              {series.length > 1 && <text x={x(last) + 9} y={y(s.values[last]) + 4} className="fill-ink text-[11.5px] font-semibold">{s.name}</text>}
            </g>
          );
        })}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={H - pb} stroke={INK} strokeOpacity={0.25} />
            {series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill={s.color} stroke="#fff" strokeWidth={2} />)}
          </g>
        )}
        <rect x={pl} y={0} width={W - pl - pr} height={H} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>

      {narrow && markers.length > 0 && (
        <ol className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-muted">
          {markers.map((m, k) => (
            <li key={`${m.label}-${k}`}><b className="mr-1.5 inline-grid size-[18px] place-items-center rounded-full border border-[#8a9b95] text-[11px] text-ink">{k + 1}</b>{m.label}</li>
          ))}
        </ol>
      )}

      {hover !== null && (
        <div className="pointer-events-none absolute top-1 z-10 grid -translate-x-1/2 gap-1 whitespace-nowrap rounded-[10px] bg-ink px-2.5 py-2 text-xs text-white" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>Minggu {labels[hover]}</b>
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <i className="size-2 rounded-full" style={{ background: s.color }} />{s.name}
              <em className="num ml-auto pl-3 font-bold not-italic">{s.values[hover]}{unit}</em>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Y range that fits the data with headroom, snapped to 5s. */
export function fitRange(values: number[], pad = 8): { min: number; max: number } {
  const lo = Math.min(...values), hi = Math.max(...values);
  const min = Math.max(0, Math.floor((lo - pad) / 5) * 5);
  return { min, max: Math.min(100, min + Math.ceil((hi + pad - min) / 20) * 20) };
}
