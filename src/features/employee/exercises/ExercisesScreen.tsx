"use client";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/lib/paths";
import { Chip, Lead, Note, Screen, Section, StartPill, Title } from "../components/ui";
import { EXERCISES, exerciseById, FEELINGS, suggestedExercises, type Exercise } from "../content";
import { useEmployee } from "../EmployeeProvider";

const cardBackground = ([a, b, c]: Exercise["colors"]) =>
  `radial-gradient(120% 90% at 20% 20%, ${a}, transparent 60%), radial-gradient(90% 90% at 85% 30%, ${c}, transparent 60%), linear-gradient(160deg, ${a}, ${b})`;

export function ExercisesScreen() {
  const { mood, sleep, saved, done } = useEmployee();
  const [feeling, setFeeling] = useState(FEELINGS[0]);
  const list = EXERCISES.filter((e) => feeling === FEELINGS[0] || e.feeling === feeling);
  const suggested = suggestedExercises(mood, sleep).map((id) => exerciseById(id)!);

  return (
    <Screen>
      <Title>Latihan</Title>
      <Lead>Latihan singkat dengan panduan. Pilih sesuai yang kamu butuhkan sekarang.</Lead>

      <Section>Disarankan untukmu</Section>
      <div className="grid gap-2">
        {suggested.map((e) => (
          <Link key={e.id} href={ROUTES.employee.exercise(e.id)}
            className="grid w-full grid-cols-[46px_1fr_auto] items-center gap-3 rounded-2xl bg-soft py-2.5 pr-3 pl-2.5 text-ink">
            <span className="size-[46px] rounded-xl" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${e.colors[1]} 60%, ${e.colors[2]})` }} />
            <span>
              <b className="block text-[13.5px] font-semibold">{e.title}</b>
              <small className="mt-0.5 block text-[11.5px] text-muted">{e.minutes}{done.includes(e.id) && " · selesai hari ini"}</small>
            </span>
            <StartPill />
          </Link>
        ))}
      </div>
      <Note>{saved ? "Berdasarkan mood dan jam tidur yang kamu catat hari ini." : "Catat mood di Beranda agar saran lebih pas."}</Note>

      <Section>Aku ingin merasa...</Section>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {FEELINGS.map((f) => <Chip key={f} on={feeling === f} onClick={() => setFeeling(f)}>{f}</Chip>)}
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-3">
        {list.map((e) => (
          <Link key={e.id} href={ROUTES.employee.exercise(e.id)} style={{ background: cardBackground(e.colors) }}
            className="relative h-[140px] overflow-hidden rounded-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.6)]">
            <span className="absolute inset-x-0 bottom-0 bg-white/50 px-3 py-2.5 text-ink backdrop-blur-sm">
              <b className="block text-[13px] font-semibold">{e.title}</b>
              <small className="text-[11px] text-[#3e5149]">{e.minutes}</small>
            </span>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
