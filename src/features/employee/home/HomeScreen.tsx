"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { hours } from "@/lib/format";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { lowMoodStreak, practiceById, programById, programState, SLOT_LABEL, suggestedPractices } from "@/lib/practice";
import { addDays, DAYS_LONG, longDate, weekday } from "@/lib/week";
import { CalmCard } from "../calm/CalmCard";
import { practiceArt } from "../exercises/ProgramCard";
import { Blob, type BlobIcon } from "../components/Blob";
import { MoodFace, MoodTile } from "../components/MoodFace";
import { appButton, CheckCircle, linkText, StartPill } from "../components/ui";
import { MOODS, moodById } from "../content";
import { useEmployee } from "../EmployeeProvider";

const MIN_SLEEP = 3;
const MAX_SLEEP = 11;

export function HomeScreen() {
  const { user, today } = useEmployee();
  return (
    <div className="flex min-h-full flex-col lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)] lg:items-start lg:gap-8 lg:px-10 lg:pt-6 lg:pb-12">
      <div className="px-[22px] pt-3.5 pb-1.5 md:px-8 md:pt-6 lg:p-0">
        <Greeting name={user.name.split(" ")[0]} date={today} />
        <CheckinReminder />
        <DailyNote />
        <LowMoodSuggestion />
        <ForYou />
        <CalmCard className="mt-4" />
      </div>
      <TodayPlan />
    </div>
  );
}

/** Short, original lines for the day. Not attributed to anyone, and never a promise of an outcome. */
const QUOTES = [
  "Kamu tidak harus produktif setiap jam untuk tetap berharga.",
  "Istirahat bukan hadiah setelah lelah. Istirahat bagian dari bekerja.",
  "Satu napas pelan sudah cukup sebagai awal.",
  "Hari ini tidak perlu sempurna. Cukup dijalani pelan-pelan.",
  "Perasaan berat itu datang dan pergi. Kamu tidak sendirian menghadapinya.",
  "Bilang \u201Cbelum bisa\u201D juga termasuk menjaga diri.",
  "Langkah kecil yang diulang lebih kuat dari rencana besar yang ditunda.",
  "Tidak apa-apa meminta bantuan. Itu tanda kamu peduli pada dirimu.",
  "Coba perhatikan satu hal baik hari ini, sekecil apa pun.",
  "Kamu sudah melewati banyak hari sulit. Hari ini juga bisa.",
  "Jeda lima menit bisa membuat sisa hari terasa lebih ringan.",
  "Bersikap lembut pada diri sendiri bukan berarti malas.",
  "Fokus pada yang bisa kamu kendalikan, lepaskan sisanya sebentar.",
  "Tidur yang cukup adalah investasi, bukan kemewahan.",
];

const GREET = [
  { until: 11, label: "Selamat pagi", photo: "hening" },
  { until: 15, label: "Selamat siang", photo: "hadir" },
  { until: 18, label: "Selamat sore", photo: "jeda" },
  { until: 24, label: "Selamat malam", photo: "sungai" },
];

/** Welcome card: greeting by time of day over a calm photo, with the day's message. */
function Greeting({ name, date }: { name: string; date: string }) {
  // The hour is read after mount so the static export does not bake in the build time.
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => setHour(new Date().getHours()), []);
  const g = GREET.find((x) => (hour ?? 9) < x.until)!;
  const dayIndex = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  const quote = QUOTES[((dayIndex % QUOTES.length) + QUOTES.length) % QUOTES.length];
  return (
    <section className="relative mt-1 overflow-hidden rounded-[24px] text-white shadow-[0_10px_30px_rgba(15,23,42,.18)]"
      style={{ background: `linear-gradient(180deg,rgba(10,25,50,.55),rgba(10,25,50,.25) 45%,rgba(10,25,50,.8)), url("${asset(`/img/latihan/${g.photo}.jpg`)}") center / cover no-repeat, #1f4f8f` }}>
      <div className="grid gap-3 px-5 pt-5 pb-5 md:px-7 md:pt-7 md:pb-6">
        <div>
          <small className="block text-[14px] font-medium opacity-85">{longDate(date)}</small>
          <h1 className="mt-0.5 text-[26px] font-bold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.35)] md:text-[28px]">{g.label}, {name}</h1>
        </div>
        <figure className="mt-6 max-w-[640px] rounded-2xl md:mt-10 bg-white/15 px-4 py-3 backdrop-blur-md">
          <figcaption className="mb-1 flex items-center gap-1.5 text-[13.5px] font-bold tracking-wide uppercase opacity-85">
            <Icon name="heart" size={13} />Pesan hari ini
          </figcaption>
          <blockquote className="text-[17.5px] leading-snug font-semibold">“{quote}”</blockquote>
        </figure>
      </div>
    </section>
  );
}

/** Practices picked from today's mood and sleep, as photo cards. */
function ForYou() {
  const { todayLog, done } = useEmployee();
  const ids = [...suggestedPractices(todayLog?.mood ?? null, todayLog?.sleep ?? 7), "napas"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <b className="text-[17.5px]">Latihan untukmu</b>
        <Link href={ROUTES.employee.exercises} className={cn(linkText, "text-[15.5px]")}>Lihat semua</Link>
      </div>
      <ul className="grid grid-cols-3 gap-2.5 md:gap-3.5">
        {ids.map((id) => {
          const p = practiceById(id);
          if (!p) return null;
          return (
            <li key={id}>
              <Link href={ROUTES.employee.exercise(id)} className="block overflow-hidden rounded-[18px] bg-soft shadow-[0_4px_14px_rgba(15,23,42,.08)]">
                <span className="relative block h-[92px] md:h-[130px]" style={{ background: practiceArt(p) }}>
                  {done.includes(id) && <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[13px] font-bold text-app-dark">Sudah</span>}
                </span>
                <span className="block px-2.5 py-2">
                  <b className="block truncate text-[15.5px] text-ink">{p.title}</b>
                  <small className="text-[14px] text-muted">{p.minutes} menit</small>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** In-app reminder from the third day of an open, unsent check-in (when the company turned it on). */
function CheckinReminder() {
  const { week, today } = useEmployee();
  const dow = (weekday(today) + 6) % 7 + 1;
  if (!week.reminder || !week.open || week.answers || dow < week.opensOn + 2) return null;
  return (
    <Link href={ROUTES.employee.checkin} className="mt-3.5 flex items-center gap-3 rounded-2xl border border-[#cfe0f7] bg-[#eef5ff] px-3.5 py-3 text-[16px] text-ink">
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
          <small className="block text-[14px] font-semibold text-app">Catatan hari ini tersimpan</small>
          <b className="block text-[17.5px]">{saved.label} · tidur {hours(todayLog.sleep)}</b>
        </div>
        <button type="button" className={cn(linkText, "text-[16px]")} onClick={() => { setMood(todayLog.mood); setSleep(todayLog.sleep); setEditing(true); }}>Ubah</button>
        {saved.id <= 2 && (
          <p className="col-span-full mt-0.5 text-[15.5px] leading-normal text-body">
            Hari yang berat. Latihan napas 3 menit bisa membantu, atau{" "}
            <Link href={ROUTES.employee.ask("Hari ini terasa berat")} className={linkText}>ceritakan ke Asisten</Link>.
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
      <h2 className="mt-4 mb-3.5 text-[26px] font-semibold text-ink">Bagaimana perasaanmu hari ini?</h2>
      <div className="grid max-w-[620px] grid-cols-5 gap-2 md:gap-3">
        {MOODS.map((m) => <MoodTile key={m.id} mood={m} selected={mood === m.id} onSelect={() => setMood(m.id)} />)}
      </div>
      {current ? (
        <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2 rounded-[18px] bg-soft px-3.5 py-3 text-[16px] font-semibold">
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
        <p className="mt-3 text-[15px] text-muted">Pilih satu. Hanya kamu yang bisa melihat catatan harianmu.</p>
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

/** Three heavy days in a row: suggest the 7-day stress program, and the assistant to talk it through. */
function LowMoodSuggestion() {
  const { days, today, programs } = useEmployee();
  if (!lowMoodStreak(days, [addDays(today, -2), addDays(today, -1), today])) return null;
  if (programs.some((e) => programById(e.program)?.kind === "praktis")) return null;
  return (
    <div className="mt-3.5 grid gap-1.5 rounded-[18px] border border-[#f3ddb8] bg-[#fff7ec] px-3.5 py-3 text-[16px] leading-normal text-[#5b4520]">
      <b>Tiga hari terakhir terasa berat</b>
      <span>Program 7 Hari Lepas Stres bisa membantu, sekitar 10 menit pagi dan malam. Ingin cerita dulu? <Link href={ROUTES.employee.ask("Tiga hari terakhir terasa berat")} className="font-bold underline underline-offset-2">Ngobrol dengan Asisten</Link>.</span>
      <Link href={ROUTES.employee.program("stres-7")} className={appButton("primary", true)}>Lihat program</Link>
    </div>
  );
}

type PlanItem = { id: string; title: string; meta: string; icon: BlobIcon; hue: string; done: boolean; href?: string; art?: string };

/** Today's three steps on a green timeline. */
function TodayPlan() {
  const { todayLog, week, done, programs, today } = useEmployee();
  const mood = todayLog?.mood ?? null;
  // Today's program sessions; without a running program, one suggested practice.
  const sessions: PlanItem[] = programs.filter((e) => !e.paused).flatMap((e) => {
    const st = programState(e, today, mood);
    if (st.finished) return [];
    return st.slots.map((s) => {
      const p = practiceById(s.practice)!;
      return {
        id: `${e.id}-${s.slot}`, title: p.title, meta: `${st.program.title} · ${SLOT_LABEL[s.slot]} · ${p.minutes} menit`,
        icon: "lungs" as const, hue: "#C27510", done: s.done, href: ROUTES.employee.session(p.id, e.id, s.slot), art: practiceArt(p),
      };
    });
  });
  const exercise = practiceById(suggestedPractices(mood, todayLog?.sleep ?? 7)[0])!;
  const checkinMeta = week.answers ? "Terkirim minggu ini" : week.open ? `${week.areas.length} pertanyaan · 3 menit · tutup Minggu` : `Dibuka ${DAYS_LONG[week.opensOn]}`;
  const plan: PlanItem[] = [
    { id: "mood", title: "Catat mood harian", meta: "10 detik", icon: "smile", hue: "#3B8EF7", done: Boolean(todayLog) },
    { id: "checkin", title: "Check-in mingguan", meta: checkinMeta, icon: "clip", hue: "#2F8F9D", done: Boolean(week.answers), href: week.open ? ROUTES.employee.checkin : undefined },
    ...(sessions.length ? sessions : [
      { id: exercise.id, title: `Latihan ${exercise.title}`, meta: `${exercise.minutes} menit`, icon: "lungs" as const, hue: "#C27510", done: done.includes(exercise.id), href: ROUTES.employee.exercise(exercise.id), art: practiceArt(exercise) },
    ]),
  ];
  const count = plan.filter((p) => p.done).length;

  return (
    <section className="relative mt-[18px] min-h-[300px] flex-1 rounded-t-[30px] bg-app px-4 pt-[18px] pb-[104px] text-white md:mx-8 md:mb-8 md:min-h-0 md:flex-none md:rounded-[26px] md:px-5 md:pb-5 lg:sticky lg:top-24 lg:m-0">
      <div className="mb-3.5 flex justify-between px-1 text-[17.5px] font-semibold">
        <span>Rencana hari ini</span>
        <span className="text-[15.5px] font-medium opacity-85">{count}/{plan.length} selesai</span>
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
      {item.art ? <span className="size-[52px] rounded-[14px]" style={{ background: item.art }} /> : <Blob hue={item.hue} icon={item.icon} />}
      <span>
        <b className={cn("block text-[16px] font-semibold", item.done && "line-through decoration-ink/35")}>{item.title}</b>
        <small className="mt-0.5 block text-[14px] text-muted">{item.meta}</small>
      </span>
      {item.done || !item.href ? <CheckCircle on={item.done} /> : <StartPill />}
    </>
  );
  const row = "grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-2xl bg-[#f1f3f7] py-2 pr-3 pl-2 text-left text-ink";
  return item.href && !item.done ? <Link href={item.href} className={row}>{body}</Link> : <div className={row}>{body}</div>;
}
