"use client";
import Link from "next/link";
import { MOOD_COLORS } from "@/components/charts/MoodBar";
import { Icon } from "@/components/ui/Icon";
import { areaById } from "@/lib/catalog";
import { decimal, hours, listJoin } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { addDays, DAYS_SHORT, shortDate, weekday } from "@/lib/week";
import { dangerSigns } from "@/lib/practice";
import { Recommendation } from "../components/Recommendation";
import { appButton, Lead, Note, Screen, Section, Title } from "../components/ui";
import { level, MOODS, moodById, type Level } from "../content";
import { useEmployee } from "../EmployeeProvider";

/** Bar height scale: 9 hours fills the track. */
const MAX_SLEEP = 9;

const LEVEL_CLASS: Record<Level, string> = {
  lo: "bg-mint text-app-dark",
  mid: "bg-warn-bg text-[#8a5300]",
  hi: "bg-bad-bg text-[#a2341f]",
};

const average = (days: { sleep: number }[]) => Math.round((days.reduce((s, d) => s + d.sleep, 0) / days.length) * 10) / 10;

export function InsightScreen() {
  return (
    <Screen>
      <Title>Insight-mu</Title>
      <Lead>Dari catatan harian dan check-in. <b>Hanya kamu yang bisa melihat halaman ini.</b></Lead>
      <div className="grid gap-x-10 lg:grid-cols-2">
        <SleepAndMood />
        <CheckinResult />
      </div>
      <Link href={ROUTES.employee.report} className="mt-5 flex items-center gap-3 rounded-[18px] border-[1.5px] border-line px-3.5 py-3 text-ink hover:bg-soft">
        <span className="grid size-10 place-items-center rounded-xl bg-mint text-app-dark"><Icon name="file" size={18} /></span>
        <span className="flex-1"><b className="block text-[14px]">Laporan pribadi (PDF)</b><small className="text-xs text-muted">Ringkasan 30 atau 90 hari untuk disimpan atau dibawa ke psikolog</small></span>
        <Icon name="chevron" size={16} className="text-muted" />
      </Link>
    </Screen>
  );
}

type Bar = { key: string; day: string; sleep: number; mood: number; today: boolean };

/** The last seven days: height is hours slept, color is that day's mood; days without a note stay empty. */
function SleepAndMood() {
  const { days, today, todayLog } = useEmployee();
  const saved = Boolean(todayLog);
  const slots = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const week: Bar[] = days.filter((d) => slots.includes(d.day)).map((d) => ({ key: d.day, day: DAYS_SHORT[weekday(d.day)], sleep: d.sleep, mood: d.mood, today: d.day === today }));
  const missing = slots.filter((d) => d !== today && !days.some((x) => x.day === d));
  const good = week.filter((d) => d.mood >= 4);
  const low = week.filter((d) => d.mood <= 2);

  return (
    <section className="mt-1.5">
      <Section>Tidur dan mood minggu ini</Section>
      {good.length > 0 && low.length > 0 && (
        <p className="mb-2 text-sm leading-normal text-body">
          Di hari mood-mu baik, kamu tidur rata-rata <b>{hours(average(good))}</b>. Di hari yang berat, hanya <b>{hours(average(low))}</b>.
        </p>
      )}
      <div className="mt-2 grid h-[190px] grid-cols-7 gap-2" role="img"
        aria-label={week.length ? week.map((d) => `${d.day}: tidur ${hours(d.sleep)}, mood ${moodById(d.mood).label}`).join("; ") : "Belum ada catatan minggu ini"}>
        {slots.map((slot) => {
          const d = week.find((x) => x.key === slot);
          if (d || slot === today) return null;
          return (
            <div key={slot} className="grid grid-rows-[auto_1fr_auto] justify-items-center gap-1" style={{ order: slots.indexOf(slot) }}>
              <small className="text-[11px] text-muted">-</small>
              <div className="h-full w-full max-w-[30px] rounded-full bg-track" />
              <small className="text-[11.5px] text-muted">{DAYS_SHORT[weekday(slot)]}</small>
            </div>
          );
        })}
        {week.map((d) => (
          <div key={d.key} style={{ order: slots.indexOf(d.key) }} className="grid grid-rows-[auto_1fr_auto] justify-items-center gap-1">
            <small className="num text-[11px] text-muted">{decimal(d.sleep)}</small>
            <div className="flex h-full w-full max-w-[30px] items-end overflow-hidden rounded-full bg-track">
              <div className="w-full rounded-full" style={{ height: `${(d.sleep / MAX_SLEEP) * 100}%`, background: MOOD_COLORS[d.mood - 1] }} />
            </div>
            <small className={cn("text-[11.5px]", d.today ? "font-bold text-ink" : "text-muted")}>{d.day}</small>
          </div>
        ))}
        {!saved && (
          <Link href={ROUTES.employee.home} aria-label="Catat hari ini di Beranda" style={{ order: 6 }} className="grid grid-rows-[auto_1fr_auto] justify-items-center gap-1">
            <small className="text-[11px] text-muted">?</small>
            <div className="h-full w-full max-w-[30px] rounded-full bg-[repeating-linear-gradient(135deg,#eef0f3_0_6px,#e1e5ea_6px_12px)] outline-[1.5px] -outline-offset-[1.5px] outline-[#b9c1cc] outline-dashed" />
            <small className="text-[11.5px] text-muted">{DAYS_SHORT[weekday(today)]}</small>
          </Link>
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-muted">
        {MOODS.map((m, i) => (
          <li key={m.id} className="inline-flex items-center gap-[5px]">
            <i className="size-[9px] rounded-[3px]" style={{ background: MOOD_COLORS[i] }} />{m.label}
          </li>
        ))}
      </ul>
      <Note>Tinggi batang = jam tidur. Warna = mood hari itu. Batang abu-abu = hari tanpa catatan.{!saved && " Hari ini belum dicatat."}{missing.length === 6 && !saved && " Mulai catat dari Beranda, 10 detik sehari."}</Note>
    </section>
  );
}

function CheckinResult() {
  const { week, history } = useEmployee();
  const last = history[history.length - 1];
  const shown = week.answers ? { label: "minggu ini", answers: week.answers } : last ? { label: `minggu ${shortDate(last.week)}`, answers: last.answers } : null;
  return (
    <section className="mt-1.5">
      <Section>Hasil check-in {shown?.label ?? "minggu ini"}</Section>
      {!week.answers && (
        <div className="mb-3 grid gap-1.5 rounded-2xl bg-soft p-3.5">
          <p className="text-[13.5px] leading-normal text-body">Isi check-in mingguan untuk melihat tingkat stres, burnout, dan kualitas tidurmu.</p>
          {week.open && <Link href={ROUTES.employee.checkin} className={appButton("primary", true)}>Mulai check-in · 3 menit</Link>}
        </div>
      )}
      {shown && <CheckinLevels answers={shown.answers} />}
      {shown && <Recommendation answers={shown.answers} className="mt-3" />}
    </section>
  );
}

function CheckinLevels({ answers }: { answers: Record<string, number> }) {
  const areas = Object.keys(answers).filter((a) => areaById(a));
  const high = areas.filter((a) => (answers[a] ?? 0) >= 3);
  return (
    <>
      <ul className="grid gap-2">
        {areas.map((a) => {
          const l = level(answers[a] ?? 0);
          return (
            <li key={a} className="flex items-center justify-between rounded-[14px] bg-soft px-3.5 py-[11px] text-sm">
              <span>{areaById(a).name}</span>
              <span className={cn("rounded-full px-2.5 py-[3px] text-xs font-bold", LEVEL_CLASS[l.tone])}>{l.label}</span>
            </li>
          );
        })}
      </ul>
      <Note>Ini gambaran dari jawabanmu, bukan diagnosis.</Note>
      {high.length > 0 && !dangerSigns(answers) && (
        <div className="mt-3 grid gap-1 rounded-2xl border border-[#f3ddb8] bg-[#fff7ec] px-3.5 py-3 text-[13px] leading-normal text-[#5b4520]">
          <b>{listJoin(high.map((a) => areaById(a).name))} sedang tinggi</b>
          <span>Bicara dengan psikolog bisa membantu. Sesinya rahasia dan perusahaan tidak tahu namamu.</span>
          <Link href={ROUTES.employee.counseling} className={appButton("primary", true)}>Lihat jadwal psikolog</Link>
        </div>
      )}
    </>
  );
}
