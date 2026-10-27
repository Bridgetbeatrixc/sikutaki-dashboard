"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { appButton, Lead } from "../components/ui";
import { GROUNDING } from "../content";

/** 5-4-3-2-1 grounding, one sense per card. Tapping a dot for each thing named is optional. */
export function Grounding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [named, setNamed] = useState(0);
  const item = GROUNDING[step];
  const last = step === GROUNDING.length - 1;

  const next = () => {
    if (last) return onDone();
    setStep(step + 1);
    setNamed(0);
  };

  return (
    <div className="grid content-start gap-3">
      <h1 className="mt-3 text-[26px] font-semibold text-ink">Kenali sekitarmu</h1>
      <Lead>Arahkan perhatian ke luar dirimu. Sebutkan dalam hati atau pelan-pelan.</Lead>

      <div key={step} className="mt-1 grid justify-items-center gap-3 rounded-[22px] bg-white px-4 pt-5 pb-4 text-center shadow-[0_8px_24px_rgba(10,102,245,.12)] animate-rise">
        <span className="num grid size-16 place-items-center rounded-full bg-app text-[30px] font-semibold text-white">{item.count}</span>
        <b className="text-[20px] leading-snug font-semibold text-ink" aria-live="polite">{item.prompt}</b>
        <small className="text-[15.5px] text-muted">Contoh: {item.hint}</small>
        <div className="mt-1 flex gap-2.5">
          {Array.from({ length: item.count }, (_, i) => (
            <button key={i} type="button" aria-label={`Hal ke-${i + 1} yang bisa kamu ${item.sense}`} aria-pressed={i < named}
              onClick={() => setNamed(i < named ? i : i + 1)}
              className={cn(
                "grid size-10 place-items-center rounded-full transition-colors",
                i < named ? "bg-app text-white" : "bg-soft text-transparent shadow-[inset_0_0_0_1.5px_#c9d6ea]",
              )}>
              <Icon name="check" size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1 flex justify-center gap-1.5" aria-label={`Bagian ${step + 1} dari ${GROUNDING.length}`}>
        {GROUNDING.map((g, i) => <i key={g.sense} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-app" : i < step ? "w-1.5 bg-app" : "w-1.5 bg-[#c9d6ea]")} />)}
      </div>

      <button type="button" className={appButton(named >= item.count ? "primary" : "ghost")} onClick={next}>
        {last ? "Selesai" : named >= item.count ? "Berikutnya" : "Lewati ke berikutnya"}
      </button>
    </div>
  );
}
