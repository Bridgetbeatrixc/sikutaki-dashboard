"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { appButton, FlowBar, Lead, linkText } from "../components/ui";
import { CALM_PATTERNS } from "../content";
import { Breathe } from "./Breathe";
import { Grounding } from "./Grounding";

type Phase = "breathe" | "ground" | "check";

/**
 * Calm-down tool for an anxiety or panic attack: breathing starts right away (no choices first),
 * then 5-4-3-2-1 grounding, then a check on how the person feels with a way to real help.
 */
export function CalmScreen() {
  const [phase, setPhase] = useState<Phase>("breathe");
  const [pattern, setPattern] = useState(CALM_PATTERNS[0].id);
  const [round, setRound] = useState(0);

  const again = () => {
    setRound((r) => r + 1);
    setPhase("breathe");
  };

  return (
    <div className="grid min-h-full grid-rows-[auto_1fr_auto] gap-2.5 bg-[linear-gradient(180deg,#eaf2fe,#fff_55%)] px-[22px] pt-2 pb-5">
      <FlowBar closeHref={ROUTES.employee.home} title="Tenangkan diri" right={<PhaseDots phase={phase} />} />
      {phase === "breathe" && <Breathe key={round} pattern={pattern} onPattern={setPattern} onNext={() => setPhase("ground")} />}
      {phase === "ground" && <Grounding onDone={() => setPhase("check")} />}
      {phase === "check" && <Check onAgain={again} />}
      <CrisisBar />
    </div>
  );
}

function PhaseDots({ phase }: { phase: Phase }) {
  const order: Phase[] = ["breathe", "ground", "check"];
  return (
    <span className="inline-flex gap-1" aria-label={`Langkah ${order.indexOf(phase) + 1} dari 3`}>
      {order.map((p) => <i key={p} className={cn("size-1.5 rounded-full", p === phase ? "bg-app" : "bg-[#c9d6ea]")} />)}
    </span>
  );
}

type Feeling = "better" | "bit" | "still";

const FEELINGS: { id: Feeling; label: string }[] = [
  { id: "better", label: "Lebih tenang" },
  { id: "bit", label: "Sedikit membaik" },
  { id: "still", label: "Masih sangat cemas" },
];

function Check({ onAgain }: { onAgain: () => void }) {
  const [feeling, setFeeling] = useState<Feeling | null>(null);

  return (
    <div className="grid content-start gap-3 animate-rise">
      <h1 className="mt-4 text-[28px] font-semibold text-ink">Bagaimana rasanya sekarang?</h1>
      <Lead>Tidak ada jawaban yang salah. Rasa cemas bisa turun pelan-pelan, tidak harus hilang sekaligus.</Lead>
      <div className="grid gap-2" role="radiogroup" aria-label="Perasaanmu sekarang">
        {FEELINGS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={feeling === f.id} onClick={() => setFeeling(f.id)}
            className={cn(
              "rounded-2xl px-4 py-3.5 text-left text-[17.5px] font-semibold transition-colors",
              feeling === f.id ? "bg-app text-white" : "bg-soft text-ink",
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {feeling === "better" && (
        <div className="mt-1 rounded-[18px] bg-white p-4 shadow-[0_6px_20px_rgba(10,102,245,.1)] animate-rise">
          <b className="block text-[17.5px]">Kamu berhasil melewatinya.</b>
          <p className="mt-1 text-[16px] leading-relaxed text-body">Ambil beberapa menit lagi sebelum kembali bekerja. Minum air dan regangkan bahu.</p>
          <Link href={ROUTES.employee.home} className={appButton()}>Kembali ke Beranda</Link>
        </div>
      )}

      {feeling === "bit" && (
        <div className="mt-1 rounded-[18px] bg-white p-4 shadow-[0_6px_20px_rgba(10,102,245,.1)] animate-rise">
          <b className="block text-[17.5px]">Itu sudah kemajuan.</b>
          <p className="mt-1 text-[16px] leading-relaxed text-body">Satu sampai dua menit napas lagi biasanya membantu tubuh ikut tenang.</p>
          <button type="button" className={appButton()} onClick={onAgain}>Ulangi latihan napas</button>
          <Link href={ROUTES.employee.home} className={appButton("ghost")}>Kembali ke Beranda</Link>
        </div>
      )}

      {feeling === "still" && (
        <div className="mt-1 rounded-[18px] bg-white p-4 shadow-[0_6px_20px_rgba(10,102,245,.1)] animate-rise">
          <b className="block text-[17.5px]">Kamu tidak harus menghadapinya sendiri.</b>
          <p className="mt-1 text-[16px] leading-relaxed text-body">
            Bicara dengan seseorang sekarang bisa membantu. Healing119 adalah layanan dukungan psikologis Kemenkes: telepon 119, lalu tekan 8.
          </p>
          <a href="tel:119" className={appButton()}>
            <span className="inline-flex items-center gap-2"><Icon name="phone" size={17} />Telepon Healing119</span>
          </a>
          <Link href={ROUTES.employee.counseling} className={appButton("ghost")}>Pesan sesi psikolog</Link>
          <button type="button" className={cn(linkText, "mt-3 block text-[16px]")} onClick={onAgain}>Atau ulangi latihan napas</button>
        </div>
      )}
    </div>
  );
}

/** Always on screen: where to get urgent help. Sikutaki is not a crisis or medical service. */
function CrisisBar() {
  return (
    <p className="rounded-2xl bg-white/80 px-3.5 py-2.5 text-[14.5px] leading-snug text-body shadow-[inset_0_0_0_1px_var(--color-line)]">
      Nyeri dada atau sesak tak membaik? Telepon <a href="tel:112" className="font-semibold text-app-dark underline underline-offset-2">112</a>.
      {" "}Teman bicara: <a href="tel:119" className="font-semibold text-app-dark underline underline-offset-2">Healing119</a> (119, tekan 8).
      {" "}Latihan relaksasi, bukan pengganti perawatan medis.
    </p>
  );
}
