"use client";
import Link from "next/link";
import { areaById } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { dangerSigns, programById, suggestionFromCheckin } from "@/lib/practice";
import { useEmployee } from "../EmployeeProvider";
import { appButton, linkText } from "./ui";

/**
 * What to do next after a check-in, from the area with the highest answer.
 * Danger signs put a psychologist and Healing119 first, before any self-guided practice.
 */
export function Recommendation({ answers, className }: { answers: Record<string, number>; className?: string }) {
  const { programs } = useEmployee();
  const box = cn("grid gap-1.5 rounded-[18px] px-3.5 py-3 text-left text-[13.5px] leading-normal", className);

  if (dangerSigns(answers)) {
    return (
      <div className={cn(box, "border border-[#f1c9c9] bg-[#fdf0f2] text-[#6b2b39]")}>
        <b>Sebaiknya bicarakan ini dengan psikolog</b>
        <span>Beberapa jawabanmu minggu ini cukup berat. Psikolog bisa membantu, sesinya rahasia. Bila butuh bantuan sekarang, hubungi Healing119 di 119 ekstensi 8, atau 112 dalam keadaan darurat.</span>
        <Link href={ROUTES.employee.counseling} className={appButton("primary", true)}>Hubungi psikolog</Link>
      </div>
    );
  }

  const s = suggestionFromCheckin(answers);
  if (!s) return null;
  const program = s.program ? programById(s.program) : undefined;
  const running = program && programs.some((e) => e.program === program.id);
  const area = areaById(s.area).name;

  return (
    <div className={cn(box, "bg-soft text-body")}>
      <b className="text-ink">Saran untukmu: {area}</b>
      {program && (
        <span>{running ? <>Program <b>{program.title}</b> sudah berjalan. Lanjutkan sesi hari ini.</> : <>Coba program <b>{program.title}</b>. {program.blurb}</>}</span>
      )}
      {s.calm && <span>Saat gelisah datang, pakai latihan <Link href={ROUTES.employee.calm} className={linkText}>Tenangkan diri</Link>: napas terpandu lalu 5-4-3-2-1.</span>}
      {s.counsel && <span>Bicara dengan <Link href={ROUTES.employee.counseling} className={linkText}>psikolog</Link> juga bisa membantu. Sesinya rahasia.</span>}
      {program && <Link href={ROUTES.employee.program(program.id)} className={appButton("primary", true)}>{running ? "Lihat program" : "Lihat dan mulai program"}</Link>}
    </div>
  );
}
