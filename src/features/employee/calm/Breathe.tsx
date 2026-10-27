"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { appButton } from "../components/ui";
import { CALM_PATTERNS, type CalmStep } from "../content";

/** Seconds of breathing after which we suggest moving on. */
const SUGGEST_AFTER = 60;

/** Which step runs after `elapsed` seconds, how long it has left, and which round this is. */
function stepAt(steps: CalmStep[], elapsed: number) {
  const cycle = steps.reduce((sum, [, s]) => sum + s, 0);
  let rest = elapsed % cycle;
  let index = 0;
  while (rest >= steps[index][1]) rest -= steps[index++][1];
  return { index, left: steps[index][1] - rest, round: Math.floor(elapsed / cycle) + 1 };
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function Breathe({ pattern, onPattern, onNext }: { pattern: string; onPattern: (id: string) => void; onNext: () => void }) {
  const current = CALM_PATTERNS.find((p) => p.id === pattern) ?? CALM_PATTERNS[0];
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  // The circle starts small and only begins to move after the first paint, so the first breath animates.
  const [ready, setReady] = useState(false);
  const [canBuzz, setCanBuzz] = useState(false);
  const [buzz, setBuzz] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setReady(true);
      setCanBuzz(typeof navigator.vibrate === "function");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const { index, left, round } = stepAt(current.steps, elapsed);
  const [label, seconds, scale] = current.steps[index];

  // A short pulse at each new step lets people follow with their eyes closed.
  useEffect(() => {
    if (buzz && running) navigator.vibrate?.(40);
  }, [index, buzz, running]);

  const choose = (id: string) => {
    setElapsed(0);
    onPattern(id);
  };

  return (
    <div className="grid content-start justify-items-center gap-2.5 text-center">
      <p className="text-[17.5px] leading-snug text-body">
        <b className="font-semibold text-ink">Kamu aman.</b> Rasa ini menakutkan, tapi akan mereda.<br />Ikuti lingkaran di bawah.
      </p>

      <div className="flex w-full flex-wrap justify-center gap-1" role="group" aria-label="Pola napas">
        {CALM_PATTERNS.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === current.id} onClick={() => choose(p.id)}
            className={cn("rounded-full px-2.5 py-[7px] text-[14.5px] font-medium whitespace-nowrap", p.id === current.id ? "bg-app text-white" : "bg-white/80 text-body shadow-[inset_0_0_0_1px_var(--color-line)]")}>
            {p.name}
          </button>
        ))}
      </div>
      <small className="-mt-1 max-w-[280px] text-[14px] leading-snug text-muted">{current.rhythm} detik. {current.text}</small>

      <div className="relative grid size-[190px] place-items-center">
        <span className="absolute inset-0 rounded-full bg-white/70 shadow-[inset_0_0_0_1.5px_#cfe0fb]" />
        <span
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#9cc4fb,#3b8ef7_55%,#0a66f5)] shadow-[0_18px_44px_rgba(10,102,245,.35)] transition-transform ease-in-out motion-reduce:transition-none"
          style={{ transform: `scale(${ready ? scale : 0.5})`, transitionDuration: `${seconds}s` }}
        />
        <b className="num relative text-[44px] leading-none font-semibold text-white [text-shadow:0_1px_8px_rgba(8,60,150,.35)]" aria-hidden="true">{left}</b>
      </div>

      <b className="min-h-7 text-[23px] font-semibold text-ink" aria-live="polite">{label}</b>
      <small className="-mt-2 text-[15.5px] text-muted">
        Putaran {round} · {clock(elapsed)}{!running && " · dijeda"}
      </small>

      {elapsed >= SUGGEST_AFTER && (
        <p className="rounded-xl bg-white/80 px-3 py-2 text-[15.5px] text-body animate-rise">
          Sudah satu menit. Lanjut kalau napasmu terasa lebih pelan, atau teruskan selama kamu butuh.
        </p>
      )}

      <div className="grid w-full grid-cols-[1fr_1.6fr] gap-2.5">
        <button type="button" className={appButton("ghost")} onClick={() => setRunning(!running)}>{running ? "Jeda" : "Lanjut"}</button>
        <button type="button" className={appButton(elapsed >= SUGGEST_AFTER ? "primary" : "ghost", false, cn(elapsed < SUGGEST_AFTER && "text-app"))} onClick={onNext}>
          Sudah lebih pelan
        </button>
      </div>

      {canBuzz && (
        <label className="flex items-center gap-2 text-[15.5px] text-body">
          <input type="checkbox" checked={buzz} onChange={(e) => setBuzz(e.target.checked)} className="size-4 accent-(--color-app)" />
          Getar di setiap langkah
        </label>
      )}
    </div>
  );
}
