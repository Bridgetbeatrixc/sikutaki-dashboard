"use client";
import Link from "next/link";
import { areaById } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { dangerSigns, practiceById, programById, suggestionFromCheckin } from "@/lib/practice";
import { useEmployee } from "../EmployeeProvider";
import { appButton, linkText } from "./ui";

/**
 * What to do next after a check-in, from the area with the highest answer: a program, the calm-down tool or a
 * practice, plus the assistant to talk it through. Only screening signs (depression, bipolar, psychosis at
 * "Sering" or more) also offer a psychologist, next to the self-guided steps.
 */
export function Recommendation({ answers, className }: { answers: Record<string, number>; className?: string }) {
  const { programs } = useEmployee();
  const box = cn("grid gap-1.5 rounded-[18px] px-3.5 py-3 text-left text-[16px] leading-normal", className);
  const s = suggestionFromCheckin(answers);

  if (dangerSigns(answers)) {
    return (
      <div className={cn(box, "border border-[#f1c9c9] bg-[#fdf0f2] text-[#6b2b39]")}>
        <b>Beberapa jawabanmu minggu ini cukup berat</b>
        <span>Mulai dengan bercerita ke Asisten: ia akan membantu memahami hasilmu dan memilih latihan yang cocok. Bila ingin, psikolog mitra juga tersedia dan sesinya rahasia.</span>
        <Link href={ROUTES.employee.ask("Bantu aku memahami hasil check-in minggu ini")} className={appButton("primary", true)}>Bahas dengan Asisten</Link>
        <span className="text-[15px]">Bila butuh bantuan sekarang: Healing119 di 119 ekstensi 8, atau 112 dalam keadaan darurat. <Link href={ROUTES.employee.counseling} className="font-bold underline underline-offset-2">Kontak psikolog</Link></span>
      </div>
    );
  }

  if (!s) return null;
  const program = s.program ? programById(s.program) : undefined;
  const practice = s.practice ? practiceById(s.practice) : undefined;
  const running = program && programs.some((e) => e.program === program.id);
  const area = areaById(s.area).name;

  return (
    <div className={cn(box, "bg-soft text-body")}>
      <b className="text-ink">Saran untukmu: {area}</b>
      {program && (
        <span>{running ? <>Program <b>{program.title}</b> sudah berjalan. Lanjutkan sesi hari ini.</> : <>Coba program <b>{program.title}</b>. {program.blurb}</>}</span>
      )}
      {s.calm && <span>Saat gelisah datang, pakai latihan <Link href={ROUTES.employee.calm} className={linkText}>Tenangkan diri</Link>: napas terpandu lalu 5-4-3-2-1.</span>}
      {practice && <span>Coba latihan <b>{practice.title}</b> ({practice.minutes} menit). {practice.blurb}</span>}
      <span>Ingin tahu kenapa ini muncul? <Link href={ROUTES.employee.ask(`Bantu aku memahami hasil ${area} di check-in-ku`)} className={linkText}>Bahas dengan Asisten</Link>.</span>
      {program && <Link href={ROUTES.employee.program(program.id)} className={appButton("primary", true)}>{running ? "Lihat program" : "Lihat dan mulai program"}</Link>}
      {practice && <Link href={ROUTES.employee.exercise(practice.id)} className={appButton("primary", true)}>Mulai latihan</Link>}
    </div>
  );
}
