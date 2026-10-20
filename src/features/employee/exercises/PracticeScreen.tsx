"use client";
import Link from "next/link";
import { ROUTES } from "@/lib/paths";
import { practiceById, programById, type Slot } from "@/lib/practice";
import { appButton, FlowBar, Lead } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { BreathPlayer } from "./BreathPlayer";
import { GuidedPlayer } from "./GuidedPlayer";
import { JournalScreen } from "./JournalScreen";
import { SilenceScreen } from "./SilenceScreen";
import { SoundPlayer } from "./SoundPlayer";

/** Opens a practice with the player for its kind; a program session counts only for a running program. */
export function PracticeScreen({ id, program, slot }: { id: string; program?: string; slot?: string }) {
  const { programs, energy } = useEmployee();
  const practice = practiceById(id)!;
  const enrollment = programs.find((e) => e.id === program);
  const session = enrollment && programById(enrollment.program)?.slots.includes(slot as Slot) ? { enrollment: enrollment.id, slot: slot as Slot } : null;

  if (practice.group === "energi" && !(energy.allowed && energy.optIn)) {
    return (
      <div className="grid min-h-full content-start gap-4 px-[22px] pt-2 pb-7 md:px-8 md:pt-6">
        <FlowBar closeHref={ROUTES.employee.exercises} title={practice.title} />
        <Lead>{energy.allowed ? "Latihan Energi belum kamu nyalakan. Kamu bisa menyalakannya di halaman Latihan atau Profil." : "Latihan Energi tidak tersedia di perusahaanmu."}</Lead>
        <Link href={ROUTES.employee.exercises} className={appButton()}>Ke halaman Latihan</Link>
      </div>
    );
  }

  switch (practice.kind) {
    case "breath": return <BreathPlayer practice={practice} session={session} />;
    case "guided": return <GuidedPlayer practice={practice} session={session} />;
    case "sound": return <SoundPlayer practice={practice} session={session} />;
    case "journal": return <JournalScreen practice={practice} session={session} />;
    case "silence": return <SilenceScreen practice={practice} session={session} />;
  }
}
