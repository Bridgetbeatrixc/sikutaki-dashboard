"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { GuidedPractice } from "@/lib/practice";
import { appButton } from "../components/ui";
import { PracticeFrame, useFinish, type Session } from "./PracticeFrame";

/** Step-by-step practice: each step shows for its own number of seconds, then the next one starts. */
export function GuidedPlayer({ practice, session }: { practice: GuidedPractice; session: Session | null }) {
  const finish = useFinish(practice, session);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(practice.steps[0].seconds);
  const [running, setRunning] = useState(true);
  const done = index >= practice.steps.length;

  useEffect(() => {
    if (!started || !running || done) return;
    const timer = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, running, done]);

  useEffect(() => {
    if (left > 0 || done) return;
    const next = index + 1;
    setIndex(next);
    setLeft(practice.steps[next]?.seconds ?? 0);
  }, [left, done, index, practice.steps]);

  const skip = () => { setIndex(index + 1); setLeft(practice.steps[index + 1]?.seconds ?? 0); };
  const step = practice.steps[Math.min(index, practice.steps.length - 1)];

  if (!started) {
    return (
      <PracticeFrame practice={practice} session={session}>
        <p className="text-[15px] leading-relaxed text-body">{practice.blurb}</p>
        <ol className="grid gap-2">
          {practice.steps.map((s, i) => (
            <li key={i} className="grid grid-cols-[24px_1fr] gap-2 text-[13.5px] leading-normal text-body">
              <span className="grid size-6 place-items-center rounded-full bg-soft text-xs font-bold text-app-dark">{i + 1}</span>{s.text}
            </li>
          ))}
        </ol>
        <button type="button" className={appButton()} onClick={() => setStarted(true)}>Mulai · {practice.minutes} menit</button>
      </PracticeFrame>
    );
  }

  return (
    <PracticeFrame practice={practice} session={session} right={done ? "" : `${index + 1}/${practice.steps.length}`}>
      <div className="flex gap-1" aria-hidden="true">
        {practice.steps.map((_, i) => <i key={i} className={cn("h-1.5 flex-1 rounded-full", i < index ? "bg-app" : i === index ? "bg-app/50" : "bg-[#e5e8ef]")} />)}
      </div>
      {done ? (
        <div className="grid min-h-[220px] place-items-center rounded-[24px] bg-soft p-6 text-center">
          <div>
            <b className="block text-xl text-ink">Latihan selesai</b>
            <p className="mt-1.5 text-sm text-body">Perhatikan sejenak bagaimana tubuhmu sekarang.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-[220px] content-center gap-3 rounded-[24px] bg-[linear-gradient(160deg,#eef4fd,#f6f9f4)] p-6 text-center" aria-live="polite">
          <p className="text-[19px] leading-snug font-semibold text-ink">{step.text}</p>
          <small className="text-[13px] text-muted">{left} detik</small>
        </div>
      )}
      {done ? (
        <button type="button" className={appButton()} onClick={finish}>Selesai</button>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" className={appButton("ghost")} onClick={() => setRunning(!running)}>{running ? "Jeda" : "Lanjut"}</button>
          <button type="button" className={appButton("ghost")} onClick={skip}>Berikutnya</button>
        </div>
      )}
    </PracticeFrame>
  );
}
