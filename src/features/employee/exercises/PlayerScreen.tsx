"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { appButton, FlowBar, Lead } from "../components/ui";
import type { Exercise } from "../content";
import { useEmployee } from "../EmployeeProvider";

/** Which step of the breathing cycle is running after `elapsed` seconds, and how long it has left. */
function stepAt(steps: Exercise["steps"], elapsed: number) {
  const cycle = steps.reduce((sum, [, s]) => sum + s, 0);
  let rest = elapsed % cycle;
  let index = 0;
  while (rest >= steps[index][1]) rest -= steps[index++][1];
  return { index, left: steps[index][1] - rest };
}

/** The circle grows while breathing in and shrinks while breathing out; hold steps keep the previous size. */
function isExpanded(steps: Exercise["steps"], index: number) {
  for (let i = index; i >= 0; i--) {
    if (steps[i][0].startsWith("Tarik")) return true;
    if (steps[i][0].startsWith("Buang")) return false;
  }
  return false;
}

export function PlayerScreen({ exercise }: { exercise: Exercise }) {
  const { done, update } = useEmployee();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const { index, left } = stepAt(exercise.steps, elapsed);
  const [label, seconds] = exercise.steps[index];
  const big = isExpanded(exercise.steps, index);

  const finish = () => {
    if (!done.includes(exercise.id)) update({ done: [...done, exercise.id] });
    router.push(ROUTES.employee.home);
  };

  return (
    <div className="grid min-h-full content-start gap-[18px] px-[22px] pt-2 pb-7">
      <FlowBar closeHref={ROUTES.employee.exercises} title={exercise.title} />
      <div className="relative mx-auto mt-7 mb-1.5 grid size-[250px] grid-rows-2 justify-items-center text-center" aria-live="polite">
        <i className={cn(
          "absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#a9dcc5_55%,#4fbf95)] shadow-[0_20px_50px_rgba(20,120,85,.25)] transition-transform ease-in-out",
          big ? "scale-100" : "scale-[.62]",
        )} style={{ transitionDuration: `${seconds}s` }} />
        <b className="relative self-end text-xl text-app-dark">{label}</b>
        <small className="relative mt-1 self-start text-[13px] text-app-dark">{left} detik</small>
      </div>
      <Lead className="text-center">Ikuti lingkaran. Ulangi beberapa putaran sampai napasmu terasa lebih pelan.</Lead>
      <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
        <button type="button" className={appButton("ghost")} onClick={() => setRunning(!running)}>{running ? "Jeda" : "Lanjut"}</button>
        <button type="button" className={appButton()} onClick={finish}>Selesai</button>
      </div>
    </div>
  );
}
