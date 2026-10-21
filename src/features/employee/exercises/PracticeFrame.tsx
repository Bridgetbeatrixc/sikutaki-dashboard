"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { ENERGY_NOTE, MOVEMENT_NOTE, programById, type Practice, type Slot } from "@/lib/practice";
import { FlowBar } from "../components/ui";
import { practiceArt } from "./ProgramCard";
import { useEmployee } from "../EmployeeProvider";

/** Today's session of a program, when the practice was opened from one. */
export type Session = { enrollment: string; slot: Slot };

/** Records the practice (and the program session) as done, then goes back to Beranda. */
export function useFinish(practice: Practice, session: Session | null) {
  const { markDone, completeSession, toast } = useEmployee();
  const router = useRouter();
  return async () => {
    if (session) {
      if (!(await completeSession(session.enrollment, session.slot, practice.id))) return;
      toast("Sesi hari ini tercatat");
    } else {
      markDone(practice.id);
    }
    router.push(ROUTES.employee.home);
  };
}

/** Frame of every practice screen: title bar, safety notes, and where to get help. */
export function PracticeFrame({ practice, session, right, children }: { practice: Practice; session: Session | null; right?: ReactNode; children: ReactNode }) {
  const { programs } = useEmployee();
  const program = session ? programById(programs.find((e) => e.id === session.enrollment)?.program ?? "") : undefined;
  return (
    <div className="grid min-h-full content-start gap-4 px-[22px] pt-2 pb-7 md:px-8 md:pt-6">
      <FlowBar closeHref={session ? ROUTES.employee.home : ROUTES.employee.exercises} title={practice.title} right={right} />
      {program && <p className="-mt-2 text-center text-xs text-muted">{program.title}</p>}
      {practice.kind !== "sound" && <div className="h-[120px] rounded-[22px] md:h-[160px]" style={{ background: practiceArt(practice) }} role="img" aria-label={practice.title} />}
      {practice.caution && <Banner icon="alert">{MOVEMENT_NOTE}</Banner>}
      {practice.group === "energi" && <Banner icon="info">{ENERGY_NOTE}</Banner>}
      {children}
      <HelpLine />
    </div>
  );
}

function Banner({ icon, children }: { icon: "alert" | "info"; children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-2xl border border-[#f3ddb8] bg-[#fff7ec] px-3.5 py-2.5 text-[12.5px] leading-normal text-[#5b4520]">
      <Icon name={icon} size={16} className="mt-px shrink-0" />{children}
    </p>
  );
}

/** Crisis lines, on every practice screen. */
export function HelpLine() {
  return (
    <p className="mt-2 rounded-2xl bg-[#fdf0f2] px-3.5 py-2.5 text-[12.5px] leading-normal text-[#6b2b39]">
      <b>Butuh bantuan sekarang?</b> Healing119 Kemenkes: telepon <a href="tel:119" className="font-semibold underline underline-offset-2">119</a> ekstensi 8.
      Keadaan darurat: <a href="tel:112" className="font-semibold underline underline-offset-2">112</a>.
    </p>
  );
}
