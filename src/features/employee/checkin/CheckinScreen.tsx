"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { areaById, CAUSES, causesFor, followUpArea, followUpQuestion, SCALE } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { DAYS_LONG } from "@/lib/week";
import { openCheckin } from "@/store/employee-actions";
import { MoodFace } from "../components/MoodFace";
import { Recommendation } from "../components/Recommendation";
import { appButton, Chip, FlowBar } from "../components/ui";
import { CHECKIN_QUESTIONS, MOODS } from "../content";
import { useEmployee } from "../EmployeeProvider";

/** Pause after picking an answer so the selection is visible before the next question. */
const ADVANCE_MS = 180;

export function CheckinScreen() {
  const { week, live, submitCheckin } = useEmployee();
  const areas = week.areas;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [causes, setCauses] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Counts toward "opened" in HR's funnel (a number only).
  useEffect(() => { if (live && week.open && !week.answers) void openCheckin(); }, [live, week.open, week.answers]);

  if (week.answers) return <CheckinDone answers={week.answers} />;
  if (!week.open) return <CheckinClosed opensOn={week.opensOn} />;

  const causeArea = followUpArea(areas, answers);
  const total = areas.length + (causeArea ? 1 : 0);
  const area = areas[index];

  const submit = async (final: Record<string, number>, picked: string[]) => {
    setSending(true);
    const ok = await submitCheckin(final, picked);
    setSending(false);
    if (!ok) setIndex(areas.length - 1);
  };

  const answer = (value: number) => {
    const next = { ...answers, [area]: value };
    setAnswers(next);
    const isLast = index === areas.length - 1 && !followUpArea(areas, next);
    window.setTimeout(() => (isLast ? submit(next, []) : setIndex(index + 1)), ADVANCE_MS);
  };

  const toggleCause = (id: string) => setCauses((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));

  return (
    <div className="grid min-h-full content-start gap-3.5 px-[22px] pt-2 pb-6 md:px-8 md:pt-6">
      <FlowBar closeHref={ROUTES.employee.home} title="Check-in mingguan" right={`${Math.min(index + 1, total)}/${total}`} />
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e8ef]">
        <i className="block h-full rounded-full bg-app transition-[width] duration-250" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      {area ? (
        <>
          <Tag>{areaById(area).name}</Tag>
          <Question>{CHECKIN_QUESTIONS[area]}</Question>
          <div className="mt-1.5 grid gap-2.5">
            {SCALE.map((label, value) => (
              <button key={label} type="button" disabled={sending} onClick={() => answer(value)} aria-pressed={answers[area] === value}
                className={cn(
                  "rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[15px]",
                  answers[area] === value ? "border-app bg-app text-white" : "border-line bg-white text-ink hover:border-app/50",
                )}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : causeArea ? (
        <>
          <Tag>Pertanyaan terakhir · {areaById(causeArea).name}</Tag>
          <Question>{followUpQuestion(causeArea)}</Question>
          <p className="text-[13.5px] leading-normal text-muted">Boleh pilih lebih dari satu. HR hanya melihat persentasenya per divisi, untuk tahu apa yang perlu diperbaiki.</p>
          <div className="flex flex-wrap gap-2">
            {causesFor(causeArea).map((id) => (
              <Chip key={id} on={causes.includes(id)} onClick={() => toggleCause(id)}>{CAUSES[id].label}</Chip>
            ))}
          </div>
          <button type="button" disabled={sending} className={appButton()} onClick={() => submit(answers, causes)}>
            {sending ? "Mengirim..." : causes.length ? "Kirim" : "Lewati dan kirim"}
          </button>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-muted">{sending ? "Mengirim..." : ""}</p>
      )}

      {index > 0 && !sending && (
        <button type="button" className="mt-0.5 justify-self-center text-sm text-muted" onClick={() => setIndex(index - 1)}>Kembali</button>
      )}
      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Icon name="lock" size={13} />Jawaban per orang tidak pernah dikirim ke HR.
      </p>
    </div>
  );
}

function CheckinClosed({ opensOn }: { opensOn: number }) {
  return (
    <div className="grid min-h-full content-start justify-items-center gap-3.5 px-[22px] pt-2 pb-6 text-center md:px-8 md:pt-6">
      <div className="w-full"><FlowBar closeHref={ROUTES.employee.home} title="Check-in mingguan" /></div>
      <span className="mt-12 grid size-16 place-items-center rounded-3xl bg-soft text-app"><Icon name="calendar" size={28} /></span>
      <Question>Check-in minggu ini dibuka {DAYS_LONG[opensOn]}</Question>
      <p className="text-sm leading-relaxed text-muted">Sambil menunggu, kamu tetap bisa mencatat mood harian dan mencoba latihan singkat.</p>
      <Link href={ROUTES.employee.home} className={appButton()}>Kembali ke beranda</Link>
    </div>
  );
}

function CheckinDone({ answers }: { answers: Record<string, number> }) {
  return (
    <div className="grid min-h-full content-start justify-items-center gap-3.5 px-[22px] pt-14 pb-6 text-center md:px-8">
      <MoodFace mood={MOODS[3]} size={96} className="rounded-3xl shadow-[0_12px_26px_rgba(0,0,0,.15)]" />
      <Question>Check-in minggu ini selesai</Question>
      <p className="text-sm leading-relaxed text-muted">
        Terima kasih. Hasil pribadimu sudah ada di Insight. Jawabanmu masuk ke rata-rata divisi tanpa nama, dan HR baru melihatnya bila ada minimal 5 penjawab. Check-in berikutnya dibuka minggu depan.
      </p>
      <Recommendation answers={answers} className="w-full" />
      <Link href={ROUTES.employee.insight} className={appButton()}>Lihat hasilku</Link>
      <Link href={ROUTES.employee.home} className="text-sm text-muted">Kembali ke beranda</Link>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <small className="mt-2.5 justify-self-start rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-app-dark">{children}</small>;
}

function Question({ children }: { children: ReactNode }) {
  return <h2 className="text-[22px] leading-snug font-semibold text-ink">{children}</h2>;
}
