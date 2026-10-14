"use client";
import Link from "next/link";
import { hours } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { Blob, type BlobIcon } from "../components/Blob";
import { MoodFace, MoodTile } from "../components/MoodFace";
import { appButton, CheckCircle, linkText, StartPill } from "../components/ui";
import { MOODS, moodById, TODAY } from "../content";
import { useEmployee } from "../EmployeeProvider";

const MIN_SLEEP = 3;
const MAX_SLEEP = 11;

export function HomeScreen() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="px-[22px] pt-3.5 pb-1.5">
        <div className="mt-1 flex items-center justify-between">
          <div>
            <span className="block text-[15px] font-bold">Hai, Dimas</span>
            <small className="block text-xs text-muted">{TODAY.long}</small>
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#cddaeb,#f1e6c8)] font-bold text-app-dark">D</span>
        </div>
        <DailyNote />
      </div>
      <TodayPlan />
    </div>
  );
}

/** Mood + sleep entry, or a summary once saved. */
function DailyNote() {
  const { mood, sleep, saved, update } = useEmployee();
  const current = mood ? moodById(mood) : null;

  if (saved && current) {
    return (
      <div className="mt-4 grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[18px] bg-soft p-3">
        <MoodFace mood={current} size={52} className="rounded-[14px]" />
        <div>
          <small className="block text-xs font-semibold text-app">Catatan hari ini tersimpan</small>
          <b className="block text-[15px]">{current.label} · tidur {hours(sleep)}</b>
        </div>
        <button type="button" className={cn(linkText, "text-sm")} onClick={() => update({ saved: false })}>Ubah</button>
        {current.id <= 2 && (
          <p className="col-span-full mt-0.5 text-[13px] leading-normal text-body">
            Hari yang berat. Latihan napas 3 menit bisa membantu, atau{" "}
            <Link href={ROUTES.employee.counseling} className={linkText}>bicara dengan psikolog</Link>.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-4 mb-3.5 text-[28px] font-semibold text-ink">Bagaimana perasaanmu hari ini?</h1>
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => <MoodTile key={m.id} mood={m} selected={mood === m.id} onSelect={() => update({ mood: m.id })} />)}
      </div>
      {current ? (
        <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2 rounded-[18px] bg-soft px-3.5 py-3 text-sm font-semibold">
          <span>Tidur semalam</span>
          <div className="flex items-center gap-2.5">
            <StepButton label="Kurangi jam tidur" onClick={() => update({ sleep: Math.max(MIN_SLEEP, sleep - 0.5) })}>−</StepButton>
            <b className="num">{hours(sleep)}</b>
            <StepButton label="Tambah jam tidur" onClick={() => update({ sleep: Math.min(MAX_SLEEP, sleep + 0.5) })}>+</StepButton>
          </div>
          <button type="button" className={appButton("primary", false, "col-span-full mt-0.5")} onClick={() => update({ saved: true })}>
            Simpan catatan hari ini
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[12.5px] text-muted">Pilih satu. Hanya kamu yang bisa melihat catatan harianmu.</p>
      )}
    </>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="size-[30px] rounded-full bg-white text-lg text-app-dark shadow-[0_2px_6px_rgba(0,0,0,.15)]">
      {children}
    </button>
  );
}

type PlanItem = { id: string; title: string; meta: string; icon: BlobIcon; hue: string; done: boolean; href?: string };

/** Today's three steps on a green timeline. */
function TodayPlan() {
  const { saved, checkin, done } = useEmployee();
  const plan: PlanItem[] = [
    { id: "mood", title: "Catat mood harian", meta: "10 detik", icon: "smile", hue: "#3B8EF7", done: saved },
    { id: "checkin", title: "Check-in mingguan", meta: "6 pertanyaan · 3 menit · tutup Minggu", icon: "clip", hue: "#2F8F9D", done: !!checkin, href: ROUTES.employee.checkin },
    { id: "napas", title: "Latihan Napas 4-7-8", meta: "3 menit", icon: "lungs", hue: "#C27510", done: done.includes("napas"), href: ROUTES.employee.exercise("napas") },
  ];
  const count = plan.filter((p) => p.done).length;

  return (
    <section className="relative mt-[18px] min-h-[360px] flex-1 rounded-t-[30px] bg-app px-4 pt-[18px] pb-[104px] text-white">
      <div className="mb-3.5 flex justify-between px-1 text-[15px] font-semibold">
        <span>Rencana hari ini</span>
        <span className="text-[13px] font-medium opacity-85">{count}/{plan.length} selesai</span>
      </div>
      <ol className="grid gap-3">
        {plan.map((p) => (
          <li key={p.id}
            className="relative grid grid-cols-[22px_1fr] items-center gap-2 not-last:after:absolute not-last:after:top-1/2 not-last:after:left-2.5 not-last:after:h-[calc(100%_+_12px)] not-last:after:w-[1.5px] not-last:after:bg-white/55 not-last:after:content-['']">
            <span className={cn("z-10 size-3.5 justify-self-center rounded-full border-2 border-white shadow-[0_0_0_3px_var(--color-app)]", p.done ? "bg-white" : "bg-app")} />
            <PlanRow item={p} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function PlanRow({ item }: { item: PlanItem }) {
  const body = (
    <>
      <Blob hue={item.hue} icon={item.icon} />
      <span>
        <b className={cn("block text-sm font-semibold", item.done && "line-through decoration-ink/35")}>{item.title}</b>
        <small className="mt-0.5 block text-[11.5px] text-muted">{item.meta}</small>
      </span>
      {item.done || !item.href ? <CheckCircle on={item.done} /> : <StartPill />}
    </>
  );
  const row = "grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-2xl bg-[#f1f3f7] py-2 pr-3 pl-2 text-left text-ink";
  return item.href && !item.done ? <Link href={item.href} className={row}>{body}</Link> : <div className={row}>{body}</div>;
}
