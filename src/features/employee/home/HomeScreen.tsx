"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { hours } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { DAYS_LONG, longDate, weekday } from "@/lib/week";
import { CalmCard } from "../calm/CalmCard";
import { Blob, type BlobIcon } from "../components/Blob";
import { MoodFace, MoodTile } from "../components/MoodFace";
import { appButton, CheckCircle, linkText, StartPill } from "../components/ui";
import { exerciseById, MOODS, moodById, suggestedExercises } from "../content";
import { useEmployee } from "../EmployeeProvider";

const MIN_SLEEP = 3;
const MAX_SLEEP = 11;

export function HomeScreen() {
  const { user, today } = useEmployee();
  return (
    <div className="flex min-h-full flex-col">
      <div className="px-[22px] pt-3.5 pb-1.5 md:px-8 md:pt-6">
        <div className="mt-1">
          <span className="block text-[15px] font-bold">Hai, {user.name.split(" ")[0]}</span>
          <small className="block text-xs text-muted">{longDate(today)}</small>
        </div>
        <CheckinReminder />
        <DailyNote />
        <CalmCard className="mt-4" />
      </div>
      <TodayPlan />
    </div>
  );
}

/** In-app reminder from the third day of an open, unsent check-in (when the company turned it on). */
function CheckinReminder() {
  const { week, today } = useEmployee();
  const dow = (weekday(today) + 6) % 7 + 1;
  if (!week.reminder || !week.open || week.answers || dow < week.opensOn + 2) return null;
  return (
    <Link href={ROUTES.employee.checkin} className="mt-3.5 flex items-center gap-3 rounded-2xl border border-[#cfe0f7] bg-[#eef5ff] px-3.5 py-3 text-[13.5px] text-ink">
      <Icon name="calendar" size={18} className="shrink-0 text-app" />
      <span className="flex-1"><b>Check-in minggu ini belum diisi.</b> Ditutup Minggu 23.59, sekitar 3 menit.</span>
      <Icon name="chevron" size={16} className="text-muted" />
    </Link>
  );
}

/** Mood + sleep entry, or a summary once saved. */
function DailyNote() {
  const { todayLog, saveDaily } = useEmployee();
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState<number | null>(todayLog?.mood ?? null);
  const [sleep, setSleep] = useState(todayLog?.sleep ?? 7);
  const [busy, setBusy] = useState(false);
  const current = mood ? moodById(mood) : null;

  if (todayLog && !editing) {
    const saved = moodById(todayLog.mood);
    return (
      <div className="mt-4 grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[18px] bg-soft p-3">
        <MoodFace mood={saved} size={52} className="rounded-[14px]" />
        <div>
          <small className="block text-xs font-semibold text-app">Catatan hari ini tersimpan</small>
          <b className="block text-[15px]">{saved.label} · tidur {hours(todayLog.sleep)}</b>
        </div>
        <button type="button" className={cn(linkText, "text-sm")} onClick={() => { setMood(todayLog.mood); setSleep(todayLog.sleep); setEditing(true); }}>Ubah</button>
        {saved.id <= 2 && (
          <p className="col-span-full mt-0.5 text-[13px] leading-normal text-body">
            Hari yang berat. Latihan napas 3 menit bisa membantu, atau{" "}
            <Link href={ROUTES.employee.counseling} className={linkText}>bicara dengan psikolog</Link>.
          </p>
        )}
      </div>
    );
  }

  const save = async () => {
    if (!mood) return;
    setBusy(true);
    const ok = await saveDaily(mood, sleep);
    setBusy(false);
    if (ok) setEditing(false);
  };

  return (
    <>
      <h1 className="mt-4 mb-3.5 text-[28px] font-semibold text-ink">Bagaimana perasaanmu hari ini?</h1>
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => <MoodTile key={m.id} mood={m} selected={mood === m.id} onSelect={() => setMood(m.id)} />)}
      </div>
      {current ? (
        <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2 rounded-[18px] bg-soft px-3.5 py-3 text-sm font-semibold">
          <span>Tidur semalam</span>
          <div className="flex items-center gap-2.5">
            <StepButton label="Kurangi jam tidur" onClick={() => setSleep(Math.max(MIN_SLEEP, sleep - 0.5))}>−</StepButton>
            <b className="num">{hours(sleep)}</b>
            <StepButton label="Tambah jam tidur" onClick={() => setSleep(Math.min(MAX_SLEEP, sleep + 0.5))}>+</StepButton>
          </div>
          <button type="button" disabled={busy} className={appButton("primary", false, "col-span-full mt-0.5")} onClick={save}>
            {busy ? "Menyimpan..." : "Simpan catatan hari ini"}
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
  const { todayLog, week, done } = useEmployee();
  const exercise = exerciseById(suggestedExercises(todayLog?.mood ?? null, todayLog?.sleep ?? 7)[0])!;
  const checkinMeta = week.answers ? "Terkirim minggu ini" : week.open ? `${week.areas.length} pertanyaan · 3 menit · tutup Minggu` : `Dibuka ${DAYS_LONG[week.opensOn]}`;
  const plan: PlanItem[] = [
    { id: "mood", title: "Catat mood harian", meta: "10 detik", icon: "smile", hue: "#3B8EF7", done: Boolean(todayLog) },
    { id: "checkin", title: "Check-in mingguan", meta: checkinMeta, icon: "clip", hue: "#2F8F9D", done: Boolean(week.answers), href: week.open ? ROUTES.employee.checkin : undefined },
    { id: exercise.id, title: `Latihan ${exercise.title}`, meta: exercise.minutes, icon: "lungs", hue: "#C27510", done: done.includes(exercise.id), href: ROUTES.employee.exercise(exercise.id) },
  ];
  const count = plan.filter((p) => p.done).length;

  return (
    <section className="relative mt-[18px] min-h-[360px] flex-1 rounded-t-[30px] bg-app px-4 pt-[18px] pb-[104px] text-white md:px-6 md:pb-8">
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
