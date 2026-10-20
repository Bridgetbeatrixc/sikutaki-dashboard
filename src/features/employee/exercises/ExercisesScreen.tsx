"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { ENERGY_NOTE, GROUPS, practiceById, PRACTICES, PROGRAMS, suggestedPractices, type PracticeGroup } from "@/lib/practice";
import { CalmCard } from "../calm/CalmCard";
import { appButton, Lead, Note, Screen, Section, StartPill, Title } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { cardBackground, kindLabel, ProgramCard } from "./ProgramCard";

export function ExercisesScreen() {
  const { todayLog, done, programs, energy } = useEmployee();
  const suggested = suggestedPractices(todayLog?.mood ?? null, todayLog?.sleep ?? 7).map((id) => practiceById(id)!);
  const showEnergy = energy.allowed && energy.optIn;
  const groups = GROUPS.filter((g) => g.id !== "energi" || showEnergy);

  return (
    <Screen>
      <Title>Latihan</Title>
      <Lead>Latihan mandiri dengan panduan, dari 1 menit sampai program beberapa minggu.</Lead>
      <CalmCard className="mt-3" />

      {programs.length > 0 && (
        <>
          <Section>Programmu</Section>
          <div className="grid gap-3 md:grid-cols-2">{programs.map((e) => <ProgramCard key={e.id} enrollment={e} />)}</div>
        </>
      )}

      <Section>Disarankan untukmu</Section>
      <div className="grid gap-2 md:grid-cols-2">
        {suggested.map((p) => (
          <Link key={p.id} href={ROUTES.employee.exercise(p.id)}
            className="grid w-full grid-cols-[46px_1fr_auto] items-center gap-3 rounded-2xl bg-soft py-2.5 pr-3 pl-2.5 text-ink">
            <span className="size-[46px] rounded-xl" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${p.colors[1]} 60%, ${p.colors[2]})` }} />
            <span>
              <b className="block text-[13.5px] font-semibold">{p.title}</b>
              <small className="mt-0.5 block text-[11.5px] text-muted">{p.minutes} menit{done.includes(p.id) && " · selesai hari ini"}</small>
            </span>
            <StartPill />
          </Link>
        ))}
      </div>
      <Note>{todayLog ? "Berdasarkan mood dan jam tidur yang kamu catat hari ini." : "Catat mood di Beranda agar saran lebih pas."}</Note>

      {groups.map((g) => <PracticeRow key={g.id} group={g.id} title={g.title} sub={g.sub} />)}
      {energy.allowed && !energy.optIn && <EnergyOptIn />}

      <Section>Program latihan</Section>
      <p className="-mt-1 mb-2.5 text-[13px] text-muted">Hari yang terlewat tidak mengulang program. Bisa dijeda atau dihentikan kapan saja.</p>
      <div className="grid gap-2.5 md:grid-cols-2">
        {PROGRAMS.map((p) => {
          const active = programs.some((e) => e.program === p.id);
          return (
            <Link key={p.id} href={ROUTES.employee.program(p.id)} className="grid gap-1 rounded-[18px] border-[1.5px] border-line bg-white p-3.5 text-ink hover:border-app/50">
              <small className="text-[11.5px] font-bold text-app-dark">{kindLabel(p.kind, p.days, p.slots.length)}</small>
              <b className="text-[14.5px]">{p.title}</b>
              <span className="text-[12.5px] leading-snug text-body">{p.blurb}</span>
              {active && <small className="mt-1 text-xs font-semibold text-app">Sedang berjalan</small>}
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}

function PracticeRow({ group, title, sub }: { group: PracticeGroup; title: string; sub: string }) {
  const { done } = useEmployee();
  const list = PRACTICES.filter((p) => p.group === group);
  return (
    <section>
      <Section>{title}</Section>
      <p className="-mt-1 mb-2.5 text-[13px] text-muted">{sub}</p>
      {group === "energi" && <p className="mb-2.5 rounded-xl bg-[#fff7ec] px-3 py-2 text-[12.5px] text-[#5b4520]">{ENERGY_NOTE}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} href={ROUTES.employee.exercise(p.id)} style={{ background: cardBackground(p.colors) }}
            className="relative h-[124px] overflow-hidden rounded-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.6)]">
            {done.includes(p.id) && <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-white text-app"><Icon name="check" size={13} /></span>}
            <span className="absolute inset-x-0 bottom-0 bg-white/55 px-3 py-2.5 text-ink backdrop-blur-sm">
              <b className="block text-[13px] leading-tight font-semibold">{p.title}</b>
              <small className="text-[11px] text-[#3e4651]">{p.minutes} menit</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Latihan Energi stays hidden until the employee turns it on. */
function EnergyOptIn() {
  const { setEnergyOptIn, toast } = useEmployee();
  const [busy, setBusy] = useState(false);
  const on = async () => {
    setBusy(true);
    if (await setEnergyOptIn(true)) toast("Latihan Energi ditampilkan. Bisa dimatikan lagi di Profil.");
    setBusy(false);
  };
  return (
    <section className="mt-5 grid gap-1.5 rounded-[18px] border border-dashed border-line p-3.5">
      <b className="text-[14.5px] text-ink">Latihan Energi (pilihan)</b>
      <p className="text-[13px] leading-normal text-body">
        Suara mangkuk bernyanyi dan gong, merasakan energi tubuh, dan latihan prana mandiri. {ENERGY_NOTE}
      </p>
      <button type="button" disabled={busy} className={appButton("ghost", true)} onClick={on}>Tampilkan Latihan Energi</button>
    </section>
  );
}
