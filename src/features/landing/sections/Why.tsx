"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { BarRow, container, SectionHead } from "../components/ui";
import { AREA_GROUPS, WHY, type WhyId } from "../content";

const ROTATE_MS = 4500;

/** Reasons rotate on their own until the visitor picks one. */
export function Why() {
  const [active, setActive] = useState<WhyId>(WHY[0].id);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((id) => WHY[(WHY.findIndex((w) => w.id === id) + 1) % WHY.length].id);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [auto]);

  return (
    <section id="kenapa" className={`${container} pt-[70px] pb-[30px] sm:pt-[110px] sm:pb-[60px]`}>
      <SectionHead title="Kenapa Sikutaki?" />
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative grid min-h-[300px] place-items-center sm:min-h-[380px]">
          <div className="absolute top-1/2 left-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_40%,#fff_0%,#e3efff_55%,#c9defd_100%)] sm:size-[380px]" />
          <div key={active} className="relative z-[1] grid w-[min(360px,100%)] animate-rise gap-3.5 rounded-[20px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,.14)]">
            <WhyPanel id={active} />
          </div>
        </div>
        <div className="grid gap-1.5">
          {WHY.map((w) => (
            <button key={w.id} type="button" aria-pressed={active === w.id}
              onClick={() => { setAuto(false); setActive(w.id); }}
              className={cn("grid gap-1 rounded-2xl px-[18px] py-4 text-left transition-colors", active === w.id ? "bg-mint" : "hover:bg-[#f4f5f8]")}>
              <b className={cn("text-lg font-semibold", active === w.id ? "text-head" : "text-muted")}>{w.title}</b>
              <span className={cn("text-[15px]", active === w.id ? "text-ink" : "text-muted")}>{w.text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LockLine({ children }: { children: string }) {
  return <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-brand"><Icon name="lock" size={14} /> {children}</div>;
}

const AVATAR_TONES = ["bg-[linear-gradient(135deg,#d6def5,#a9b8e6)]", "bg-[linear-gradient(135deg,#cfd9e7,#9fb4cf)]", "bg-[linear-gradient(135deg,#f6d6c0,#eeb48f)]"];

function WhyPanel({ id }: { id: WhyId }) {
  switch (id) {
    case "anon":
      return (
        <>
          <div className="flex items-baseline justify-between"><b className="font-semibold">Tim Keuangan</b><small className="text-muted">12 orang</small></div>
          <div className="flex">
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} className={cn("size-[34px] rounded-full border-3 border-white blur-[1.5px] not-first:-ml-2", AVATAR_TONES[i % 3])} />
            ))}
          </div>
          <BarRow label="Rata-rata stres" value={44} color="#7B61D1" />
          <LockLine>Jawaban individu tidak ditampilkan</LockLine>
        </>
      );
    case "areas":
      return (
        <div className="flex flex-wrap gap-[7px]">
          {AREA_GROUPS.flatMap((g) => g.areas.map((a) => (
            <span key={a} className="rounded-full border-[1.5px] bg-white px-[11px] py-1 text-[12.5px] font-semibold" style={{ borderColor: g.color, color: g.color }}>{a}</span>
          )))}
        </div>
      );
    case "psy":
      return (
        <>
          <div className="rounded-[16px_16px_16px_4px] bg-mint px-3.5 py-3 text-sm">Skor kecemasanmu tinggi 3 minggu terakhir. Mau ngobrol dengan psikolog?</div>
          <div className="flex flex-wrap gap-2">
            {["Sel 19.00", "Rab 20.00", "Kam 19.30"].map((s, i) => (
              <span key={s} className={cn("rounded-[10px] border px-2.5 py-1.5 font-mono text-[12.5px]", i === 1 ? "border-brand bg-brand text-white" : "border-line")}>{s}</span>
            ))}
          </div>
          <LockLine>Rahasia, tidak dilaporkan ke kantor</LockLine>
        </>
      );
    case "fast":
      return (
        <ol className="grid">
          {[["Senin", "HR unggah daftar email"], ["Rabu", "Check-in pertama terkirim"], ["Jumat", "Dashboard mulai terisi"]].map(([day, text], i) => (
            <li key={day} className="relative flex items-start gap-3.5 pb-[18px] last:pb-0 not-last:before:absolute not-last:before:top-8 not-last:before:bottom-0.5 not-last:before:left-[15px] not-last:before:w-0.5 not-last:before:bg-line not-last:before:content-['']">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-bold text-brand">{i + 1}</span>
              <div><b className="block font-semibold">{day}</b><small className="text-[13.5px] text-muted">{text}</small></div>
            </li>
          ))}
        </ol>
      );
  }
}
