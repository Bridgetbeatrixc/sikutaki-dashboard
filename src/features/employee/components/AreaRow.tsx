"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { guideOf } from "@/lib/area-guide";
import { areaById, groupOf } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { practiceById } from "@/lib/practice";
import { shortDate } from "@/lib/week";
import { level, type Level } from "../content";

export const LEVEL_CLASS: Record<Level, string> = {
  lo: "bg-mint text-app-dark",
  mid: "bg-warn-bg text-[#8a5300]",
  hi: "bg-bad-bg text-[#a2341f]",
};

/** One line under every result list, so no score can be read the wrong way round. */
export function ScoreKey({ className }: { className?: string }) {
  return (
    <p className={cn("flex gap-1.5 rounded-xl bg-soft px-3 py-2 text-[14.5px] leading-snug text-body", className)}>
      <Icon name="info" size={14} className="mt-px shrink-0 text-app" />
      <span>Setiap pertanyaan menanyakan <b>seberapa sering</b> kamu mengalaminya. Makin sering, makin perlu perhatian. <b>Aman</b> = jarang atau tidak pernah, <b>Perlu dipantau</b> = kadang-kadang, <b>Perlu perhatian</b> = sering atau hampir selalu.</span>
    </p>
  );
}

/**
 * An area result that explains itself, always shown in full: what it measures, what the answer means, and one
 * thing to do, with a practice to start and a link to talk it through with the assistant.
 */
export function AreaRow({ area, answer, date, compact = false }: { area: string; answer: number | null; date?: string; compact?: boolean }) {
  const a = areaById(area);
  const g = guideOf(area);
  const l = answer === null ? null : level(answer);
  const practice = practiceById(g.practice);
  return (
    <li className="overflow-hidden rounded-[14px] bg-soft text-[16px] break-inside-avoid">
      <div className={cn("flex w-full items-center justify-between gap-2 text-left font-semibold", compact ? "px-3 py-2" : "px-3.5 py-[11px]")}>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5"><i className="size-2 shrink-0 rounded-full" style={{ background: groupOf(a.group).color }} />{a.name}</span>
          {a.alias && !compact && <small className="block pl-3.5 text-[14px] text-muted">{a.alias}</small>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {l ? <span className={cn("rounded-full px-2.5 py-[3px] text-[14px] font-bold", LEVEL_CLASS[l.tone])}>{l.label}</span>
            : <span className="rounded-full bg-white px-2.5 py-[3px] text-[14px] font-semibold text-muted">Belum dinilai</span>}
        </span>
      </div>
      <div className="grid gap-2 border-t border-white px-3.5 pt-2.5 pb-3 text-[15.5px] leading-normal text-body">
          <p><b className="text-ink">Yang diukur.</b> {a.desc}</p>
          {l && answer !== null ? (
            <p><b className="text-ink">Arti hasilmu.</b> Kamu menjawab &ldquo;{l.freq}&rdquo;{date ? ` di check-in minggu ${shortDate(date)}` : ""}. {answer >= 2 ? g.high : "Ini jarang kamu alami, jadi area ini dalam kondisi baik."}</p>
          ) : (
            <p><b className="text-ink">Belum dinilai.</b> Area ini ditanyakan bergiliran di check-in mingguan dan akan muncul dalam beberapa minggu.</p>
          )}
          {(answer ?? 0) >= 2 && (
            <>
              <p><b className="text-ink">Yang bisa kamu lakukan.</b> {g.tip}</p>
              <div className="flex flex-wrap gap-2 print:hidden">
                {practice && <Link href={ROUTES.employee.exercise(practice.id)} className="rounded-full bg-app px-3 py-1.5 text-[15px] font-semibold text-white">Coba {practice.title} · {practice.minutes} menit</Link>}
                <Link href={ROUTES.employee.ask(`Bantu aku memahami hasil ${a.name} di check-in-ku`)} className="rounded-full bg-white px-3 py-1.5 text-[15px] font-semibold text-app-dark">Bahas dengan Asisten</Link>
              </div>
            </>
          )}
      </div>
    </li>
  );
}
