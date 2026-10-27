"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { MOVEMENT_NOTE, practiceById, programById, programState, SLOT_LABEL } from "@/lib/practice";
import { appButton, FlowBar, Lead, Note, Section } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { HelpLine } from "./PracticeFrame";
import { kindLabel, ProgramCard, programArt } from "./ProgramCard";

export function ProgramScreen({ id }: { id: string }) {
  const { programs, startProgram, pauseProgram, stopProgram, today, todayLog } = useEmployee();
  const router = useRouter();
  const p = programById(id)!;
  const mine = programs.find((e) => e.program === id);
  const other = programs.find((e) => e.program !== id && programById(e.program)?.kind === p.kind);
  const [busy, setBusy] = useState(false);
  const run = async (call: () => Promise<unknown>) => { setBusy(true); await call(); setBusy(false); };

  const start = () => run(async () => { if (await startProgram(id)) router.refresh(); });
  const stop = () => {
    const finished = mine && programState(mine, today, todayLog?.mood ?? null).finished;
    if (!finished && !window.confirm("Hentikan program ini? Kemajuanmu tidak disimpan untuk dilanjutkan.")) return;
    void run(async () => { if (mine && (await stopProgram(mine.id))) router.push(ROUTES.employee.exercises); });
  };

  // The plan, a row per day (practical programs) or per week (routine programs).
  const rows = p.kind === "praktis"
    ? Array.from({ length: p.days }, (_, d) => ({ label: `Hari ${d + 1}`, items: p.slots.map((s) => `${SLOT_LABEL[s]}: ${practiceById(p.session(d, s))!.title}`) }))
    : Array.from({ length: p.days / 7 }, (_, w) => ({
        label: `Minggu ${w + 1}`,
        items: [...new Set(Array.from({ length: 7 }, (_, i) => practiceById(p.session(w * 7 + i, "harian"))!.title))],
      }));
  const moves = Array.from({ length: p.days }, (_, d) => p.slots.map((s) => practiceById(p.session(d, s))!)).flat().some((x) => x.caution);

  return (
    <div className="grid min-h-full content-start gap-3.5 px-[22px] pt-2 pb-[104px] md:px-8 md:pt-6 md:pb-10">
      <FlowBar closeHref={ROUTES.employee.exercises} title="Program" />
      <div className="h-[140px] rounded-[22px] md:h-[190px]" style={{ background: programArt(p.id) }} role="img" aria-label={p.title} />
      <div>
        <small className="rounded-full bg-mint px-2.5 py-1 text-[14px] font-bold text-app-dark">{kindLabel(p.kind, p.days, p.slots.length)}</small>
        <h1 className="mt-3 text-[26px] leading-tight font-semibold text-ink">{p.title}</h1>
        <Lead className="mt-1.5">{p.blurb}</Lead>
      </div>

      {mine ? (
        <>
          <ProgramCard enrollment={mine} link={false} />
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" disabled={busy} className={appButton("ghost", true, "mt-0")} onClick={() => run(() => pauseProgram(mine.id, !mine.paused))}>
              {mine.paused ? "Lanjutkan program" : "Jeda program"}
            </button>
            <button type="button" disabled={busy} className={appButton("ghost", true, "mt-0 text-bad")} onClick={stop}>
              {programState(mine, today, todayLog?.mood ?? null).finished ? "Tutup program" : "Hentikan"}
            </button>
          </div>
          {mine.paused && <Note>Program dijeda. Saat kamu mengerjakan sesi berikutnya, program otomatis berlanjut.</Note>}
        </>
      ) : other ? (
        <div className="rounded-2xl bg-soft p-3.5 text-[16px] leading-normal text-body">
          Kamu sedang menjalani <b>{programById(other.program)?.title}</b>. Hanya satu program {p.kind} yang bisa berjalan sekaligus, jadi hentikan program itu dulu bila ingin menggantinya.
        </div>
      ) : (
        <button type="button" disabled={busy} className={appButton()} onClick={start}>{busy ? "Memulai..." : "Mulai program"}</button>
      )}

      <ul className="grid gap-1.5 text-[15.5px] leading-normal text-body">
        <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-app" />Hari yang terlewat tidak mengulang program dari awal. Program berlanjut dari sesi terakhirmu.</li>
        <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-app" />Bisa dijeda atau dihentikan kapan saja.</li>
        <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-app" />Satu program praktis dan satu program rutin bisa berjalan bersamaan.</li>
      </ul>
      {moves && <p className="rounded-2xl border border-[#f3ddb8] bg-[#fff7ec] px-3.5 py-2.5 text-[15px] leading-normal text-[#5b4520]">{MOVEMENT_NOTE}</p>}

      <Section>Rencana latihan</Section>
      <ol className="grid gap-2">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[78px_1fr] gap-2 rounded-[14px] bg-soft px-3.5 py-2.5 text-[15.5px]">
            <b className="text-ink">{r.label}</b>
            <span className="text-body">{r.items.join(" · ")}</span>
          </li>
        ))}
      </ol>
      <Note>Latihan untuk relaksasi dan kebiasaan sehat, bukan pengganti perawatan medis atau psikologis.</Note>
      <HelpLine />
    </div>
  );
}
