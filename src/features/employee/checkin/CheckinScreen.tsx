"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { areaById } from "@/lib/data";
import { CAUSES } from "@/lib/focus";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { MoodFace } from "../components/MoodFace";
import { appButton, Chip, FlowBar } from "../components/ui";
import { CHECKIN_AREAS, CHECKIN_QUESTIONS, FOLLOW_UP_CAUSES, MOODS, needsFollowUp, SCALE } from "../content";
import { useEmployee } from "../EmployeeProvider";

/** Pause after picking an answer so the selection is visible before the next question. */
const ADVANCE_MS = 180;

export function CheckinScreen() {
  const { checkin, update } = useEmployee();
  // Opening the check-in after it was sent shows the done screen.
  const [index, setIndex] = useState(checkin ? Number.POSITIVE_INFINITY : 0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [causes, setCauses] = useState<string[]>([]);

  const total = CHECKIN_AREAS.length + (needsFollowUp(answers) ? 1 : 0);
  const area = CHECKIN_AREAS[index];

  const submit = (final: Record<string, number>) => {
    update({ checkin: final, causes });
    setIndex(Number.POSITIVE_INFINITY);
  };

  const answer = (value: number) => {
    const next = { ...answers, [area]: value };
    setAnswers(next);
    const isLast = index === CHECKIN_AREAS.length - 1 && !needsFollowUp(next);
    window.setTimeout(() => (isLast ? submit(next) : setIndex(index + 1)), ADVANCE_MS);
  };

  const toggleCause = (id: string) => setCauses((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));

  if (checkin && index >= total) return <CheckinDone />;

  return (
    <div className="grid min-h-full content-start gap-3.5 px-[22px] pt-2 pb-6">
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
              <button key={label} type="button" onClick={() => answer(value)} aria-pressed={answers[area] === value}
                className={cn(
                  "rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[15px]",
                  answers[area] === value ? "border-app bg-app text-white" : "border-line bg-white text-ink hover:border-app/50",
                )}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Tag>Pertanyaan terakhir</Tag>
          <Question>Apa yang paling menguras energimu minggu ini?</Question>
          <p className="text-[13.5px] leading-normal text-muted">Boleh pilih lebih dari satu. HR hanya melihat persentasenya per divisi, untuk tahu apa yang perlu diperbaiki.</p>
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_CAUSES.map((id) => (
              <Chip key={id} on={causes.includes(id)} onClick={() => toggleCause(id)}>{CAUSES[id].label}</Chip>
            ))}
          </div>
          <button type="button" className={appButton()} onClick={() => submit(answers)}>{causes.length ? "Kirim" : "Lewati dan kirim"}</button>
        </>
      )}

      {index > 0 && (
        <button type="button" className="mt-0.5 justify-self-center text-sm text-muted" onClick={() => setIndex(index - 1)}>Kembali</button>
      )}
      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Icon name="lock" size={13} />Jawaban per orang tidak pernah dikirim ke HR.
      </p>
    </div>
  );
}

function CheckinDone() {
  return (
    <div className="grid min-h-full content-start justify-items-center gap-3.5 px-[22px] pt-14 pb-6 text-center">
      <MoodFace mood={MOODS[3]} size={96} className="rounded-3xl shadow-[0_12px_26px_rgba(0,0,0,.15)]" />
      <Question>Check-in minggu ini selesai</Question>
      <p className="text-sm leading-relaxed text-muted">
        Terima kasih. Hasil pribadimu sudah ada di Insight. Jawabanmu masuk ke rata-rata divisi tanpa nama, dan HR baru melihatnya bila ada minimal 5 penjawab.
      </p>
      <Link href={ROUTES.employee.insight} className={appButton()}>Lihat hasilku</Link>
      <Link href={ROUTES.employee.home} className="text-sm text-muted">Kembali ke beranda</Link>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return <small className="mt-2.5 justify-self-start rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-app-dark">{children}</small>;
}

function Question({ children }: { children: string }) {
  return <h2 className="text-[22px] leading-snug font-semibold text-ink">{children}</h2>;
}
