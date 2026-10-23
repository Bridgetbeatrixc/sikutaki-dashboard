"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Small motion helpers for the reports: numbers count up, bars grow and sections fade in once they scroll into
 * view. Reduced-motion users and printing get the final state at once, so a saved PDF never shows half a chart.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** True once the element has been on screen (or the page is printed). `instant` skips the animation. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ seen: false, instant: false });
  useEffect(() => {
    if (reduced()) { setState({ seen: true, instant: true }); return; }
    const onPrint = () => setState({ seen: true, instant: true });
    window.addEventListener("beforeprint", onPrint);
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setState({ seen: true, instant: true }); return () => window.removeEventListener("beforeprint", onPrint); }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState((s) => ({ ...s, seen: true })); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener("beforeprint", onPrint); };
  }, []);
  return { ref, ...state };
}

/** A number that counts up from 0 when it comes into view. */
export function CountUp({ value, decimals = 0, duration = 900, className }: { value: number; decimals?: number; duration?: number; className?: string }) {
  const { ref, seen, instant } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (instant) { setShown(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setShown(value * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, instant, value, duration]);
  return <span ref={ref} className={cn("num", className)}>{shown.toFixed(decimals).replace(".", ",")}</span>;
}

/** Fades and lifts its children in when they scroll into view. */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" }) {
  const { ref, seen, instant } = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref as never} style={{ transitionDelay: instant ? "0ms" : `${delay}ms` }}
      className={cn("transition-[opacity,translate] duration-500 ease-out print:translate-y-0 print:opacity-100", seen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}>
      {children}
    </Tag>
  );
}

/** Horizontal bar that grows to `pct` (0-100) when in view. */
export function GrowBar({ pct, color, className, track = "bg-track", delay = 0 }: { pct: number; color: string; className?: string; track?: string; delay?: number }) {
  const { ref, seen, instant } = useInView<HTMLDivElement>();
  const style: CSSProperties = { width: `${seen ? Math.max(0, Math.min(100, pct)) : 0}%`, background: color, transitionDelay: instant ? "0ms" : `${delay}ms` };
  return (
    <div ref={ref} className={cn("h-2 overflow-hidden rounded-full", track, className)}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={style} />
    </div>
  );
}

/** Circular gauge that draws itself; the number in the middle counts up. */
export function ScoreRing({ value, color, size = 132, stroke = 12, label, sub, track = "#e8edf5", textClass = "text-ink" }: {
  value: number | null; color: string; size?: number; stroke?: number; label?: ReactNode; sub?: ReactNode; track?: string; textClass?: string;
}) {
  const { ref, seen, instant } = useInView<HTMLDivElement>();
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const k = value === null ? 0 : Math.max(0, Math.min(100, value)) / 100;
  return (
    <div ref={ref} className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={seen ? c * (1 - k) : c}
          style={{ transition: instant ? "none" : "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div className={cn("absolute grid justify-items-center text-center", textClass)}>
        {value === null ? <b className="text-[13px] leading-tight font-semibold">Belum cukup<br />data</b> : <b className="text-[34px] leading-none font-bold"><CountUp value={value} /></b>}
        {label && <small className="mt-1 text-[11px] font-semibold opacity-80">{label}</small>}
        {sub}
      </div>
    </div>
  );
}
