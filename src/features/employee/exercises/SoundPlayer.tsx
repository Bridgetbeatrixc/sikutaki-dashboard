"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { SoundPractice } from "@/lib/practice";
import { appButton, Chip, Note } from "../components/ui";
import { audioContext, playSound, type SoundHandle } from "./audio";
import { PracticeFrame, useFinish, type Session } from "./PracticeFrame";

const DURATIONS = [5, 10, 20];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Plays a sound made in the browser for a chosen number of minutes, then fades out. */
export function SoundPlayer({ practice, session }: { practice: SoundPractice; session: Session | null }) {
  const finish = useFinish(practice, session);
  const [minutes, setMinutes] = useState(practice.minutes);
  const [left, setLeft] = useState(practice.minutes * 60);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const handle = useRef<SoundHandle | null>(null);

  const stop = () => { handle.current?.stop(); handle.current = null; setPlaying(false); };
  const play = async () => {
    ctx.current ??= audioContext();
    if (!ctx.current) return;
    await ctx.current.resume();
    handle.current = playSound(ctx.current, practice.sound);
    setEnded(false);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (left > 0 || !playing) return;
    handle.current?.stop(4);
    handle.current = null;
    setPlaying(false);
    setEnded(true);
  }, [left, playing]);

  // Leaving the screen stops the sound.
  useEffect(() => () => { handle.current?.stop(0.3); void ctx.current?.close(); }, []);

  const pick = (m: number) => { setMinutes(m); setLeft(m * 60); setEnded(false); };

  return (
    <PracticeFrame practice={practice} session={session}>
      <div className="relative mx-auto mt-3 grid size-[230px] place-items-center">
        <i className={cn("absolute inset-0 rounded-full", playing && "animate-pulse")}
          style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${practice.colors[1]} 60%, ${practice.colors[2]})` }} />
        <div className="relative text-center">
          <b className="num block text-[34px] font-semibold text-ink">{clock(Math.max(left, 0))}</b>
          <small className="text-[13px] text-body">{ended ? "Selesai" : playing ? "Sedang diputar" : "Siap diputar"}</small>
        </div>
      </div>
      <p className="text-center text-sm text-body">{practice.blurb}</p>
      {!playing && (
        <div className="flex justify-center gap-2">
          {DURATIONS.map((m) => <Chip key={m} on={minutes === m} onClick={() => pick(m)}>{`${m} menit`}</Chip>)}
        </div>
      )}
      <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
        <button type="button" className={cn(appButton("ghost"), "flex items-center justify-center gap-2")}
          onClick={() => (playing ? stop() : ended ? (pick(minutes), play()) : play())}>
          <Icon name={playing ? "x" : "chevron"} size={16} />{playing ? "Jeda" : ended ? "Putar lagi" : "Putar"}
        </button>
        <button type="button" className={appButton()} onClick={() => { stop(); void finish(); }}>Selesai</button>
      </div>
      <Note>Suara dibuat langsung di perangkatmu, tanpa rekaman. Pakai earphone dengan volume pelan.</Note>
    </PracticeFrame>
  );
}
