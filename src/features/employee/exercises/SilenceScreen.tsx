"use client";
import { useEffect, useRef, useState } from "react";
import type { SilencePractice } from "@/lib/practice";
import { appButton, Chip, Note } from "../components/ui";
import { audioContext, chime } from "./audio";
import { PracticeFrame, useFinish, type Session } from "./PracticeFrame";

const DURATIONS = [3, 5, 10];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A quiet timer with a soft bell at the start and the end. No prayer text: each person fills it with their own. */
export function SilenceScreen({ practice, session }: { practice: SilencePractice; session: Session | null }) {
  const finish = useFinish(practice, session);
  const [minutes, setMinutes] = useState(practice.minutes);
  const [left, setLeft] = useState<number | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  const bell = async () => {
    ctx.current ??= audioContext();
    if (!ctx.current) return;
    await ctx.current.resume();
    chime(ctx.current);
  };

  useEffect(() => {
    if (left === null || left <= 0) return;
    const timer = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  useEffect(() => { if (left === 0) void bell(); }, [left]);
  useEffect(() => () => { void ctx.current?.close(); }, []);

  const start = () => { void bell(); setLeft(minutes * 60); };
  const ended = left === 0;

  return (
    <PracticeFrame practice={practice} session={session}>
      <div className="relative mx-auto mt-3 grid size-[230px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#d9dee7_60%,#eceae3)]">
        <div className="text-center">
          <b className="num block text-[34px] font-semibold text-ink">{clock(left ?? minutes * 60)}</b>
          <small className="text-[13px] text-body">{ended ? "Waktu hening selesai" : left !== null ? "Hening" : "Siap"}</small>
        </div>
      </div>
      <p className="text-center text-sm leading-relaxed text-body">Gunakan waktu ini untuk berdoa, berzikir, bermeditasi, atau sekadar diam, sesuai keyakinanmu.</p>
      {left === null && (
        <>
          <div className="flex justify-center gap-2">
            {DURATIONS.map((m) => <Chip key={m} on={minutes === m} onClick={() => setMinutes(m)}>{`${m} menit`}</Chip>)}
          </div>
          <button type="button" className={appButton()} onClick={start}>Mulai</button>
        </>
      )}
      {left !== null && (
        <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
          <button type="button" className={appButton("ghost")} onClick={() => setLeft(null)}>Ulangi</button>
          <button type="button" className={appButton()} onClick={finish}>Selesai</button>
        </div>
      )}
      <Note>Lonceng lembut berbunyi saat mulai dan selesai. Sikutaki tidak mencatat agama atau keyakinanmu.</Note>
    </PracticeFrame>
  );
}
