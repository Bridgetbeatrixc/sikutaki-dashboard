"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { practiceById, programState, progressLabel, SLOT_LABEL, type Enrollment, type Practice } from "@/lib/practice";
import { CheckCircle, StartPill } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

export const cardBackground = ([a, b, c]: Practice["colors"]) =>
  `radial-gradient(120% 90% at 20% 20%, ${a}, transparent 60%), radial-gradient(90% 90% at 85% 30%, ${c}, transparent 60%), linear-gradient(160deg, ${a}, ${b})`;

/** Photo of a practice (from Unsplash, in public/img/latihan), over its soft colors while it loads. */
export const practiceArt = (p: Pick<Practice, "id" | "colors">) =>
  `url("${asset(`/img/latihan/${p.id}.jpg`)}") center / cover no-repeat, ${cardBackground(p.colors)}`;

/** Cover photo of a program (public/img/program). */
export const programArt = (id: string) => `url("${asset(`/img/program/${id}.jpg`)}") center / cover no-repeat, linear-gradient(160deg,#eef4fd,#cfe0f7)`;

export const kindLabel = (kind: "praktis" | "rutin", days: number, slots: number) =>
  kind === "praktis" ? `Praktis · ${slots}x sehari selama ${days} hari` : `Rutin · setiap hari selama ${days / 7} minggu`;

/** A running program: progress and today's sessions, each one tap from its practice. */
export function ProgramCard({ enrollment, link = true }: { enrollment: Enrollment; link?: boolean }) {
  const { today, todayLog } = useEmployee();
  const st = programState(enrollment, today, todayLog?.mood ?? null);
  const pct = Math.round((st.daysDone / st.program.days) * 100);
  return (
    <div className="grid gap-2.5 rounded-[20px] bg-[linear-gradient(160deg,#eef4fd,#f4f8f1)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <b className="block text-[14.5px] text-ink">{st.program.title}</b>
          <small className="text-xs text-muted">{progressLabel(st.program, st.day)}{enrollment.paused && " · dijeda"}</small>
        </div>
        {link && (
          <Link href={ROUTES.employee.program(st.program.id)} className="flex shrink-0 items-center text-[12.5px] font-semibold text-app">
            Detail<Icon name="chevron" size={14} />
          </Link>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan program">
        <i className="block h-full rounded-full bg-app" style={{ width: `${pct}%` }} />
      </div>
      {st.finished ? (
        <p className="text-[13px] text-body">Semua hari program sudah dikerjakan. Buka detail untuk menutupnya.</p>
      ) : (
        <ul className="grid gap-2">
          {st.slots.map((s) => {
            const p = practiceById(s.practice)!;
            const body = (
              <>
                <span className="size-10 rounded-xl" style={{ background: practiceArt(p) }} />
                <span className="min-w-0">
                  <b className={cn("block text-[13.5px] font-semibold", s.done && "line-through decoration-ink/35")}>{p.title}</b>
                  <small className="text-[11.5px] text-muted">{SLOT_LABEL[s.slot]} · {p.minutes} menit</small>
                </span>
                {s.done ? <CheckCircle on /> : <StartPill />}
              </>
            );
            const row = "grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-2xl bg-white py-2 pr-3 pl-2 text-ink";
            return (
              <li key={s.slot}>
                {s.done ? <div className={row}>{body}</div> : <Link href={ROUTES.employee.session(p.id, enrollment.id, s.slot)} className={row}>{body}</Link>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
