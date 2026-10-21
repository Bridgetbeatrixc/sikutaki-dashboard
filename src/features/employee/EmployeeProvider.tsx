"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { followUpArea } from "@/lib/catalog";
import { programById, programState, type Slot } from "@/lib/practice";
import { loadEmployee, logFinishedProgram, saveEmployee, type EmployeeData } from "@/store/employee";
import * as actions from "@/store/employee-actions";

/*
 * The employee's own data, kept in this browser (frontend-only version). Loaded after the first render,
 * because localStorage exists only in the browser, and saved again after every change.
 */

type Day = EmployeeData["days"][number];

type EmployeeContextValue = EmployeeData & {
  /** Today's mood and sleep, once saved. */
  todayLog: Day | null;
  saveDaily: (mood: number, sleep: number) => Promise<boolean>;
  submitCheckin: (answers: Record<string, number>, causes: string[]) => Promise<boolean>;
  markDone: (exercise: string) => void;
  /** Starts a program; resolves to the enrollment id, or null when it could not start. */
  startProgram: (programId: string) => Promise<string | null>;
  pauseProgram: (enrollmentId: string, paused: boolean) => Promise<boolean>;
  stopProgram: (enrollmentId: string) => Promise<boolean>;
  /** Records today's session of a program slot (and the practice as done). */
  completeSession: (enrollmentId: string, slot: Slot, practice: string) => Promise<boolean>;
  setEnergyOptIn: (on: boolean) => Promise<boolean>;
  reportPartner: (partnerId: string, reason: string) => Promise<boolean>;
  updateUser: (name: string, teamId: string) => Promise<boolean>;
  toastMsg: string | null;
  toast: (msg: string) => void;
};

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EmployeeData | null>(null);
  useEffect(() => setData(loadEmployee()), []);
  if (!data) return <div className="grid min-h-dvh place-items-center text-sm text-muted">Memuat...</div>;
  return <EmployeeState data={data}>{children}</EmployeeState>;
}

function EmployeeState({ data, children }: { data: EmployeeData; children: ReactNode }) {
  const [state, setState] = useState(data);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => { saveEmployee(state); }, [state]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3600);
  }, []);

  /** Runs a server action; returns false (and shows why) when it failed. */
  const send = useCallback(async (call: () => Promise<actions.Result>) => {
    if (!data.live) return true;
    try {
      const res = await call();
      if (!res.ok) toast(res.error);
      return res.ok;
    } catch {
      toast("Gagal menyimpan di peramban ini.");
      return false;
    }
  }, [data.live, toast]);

  const saveDaily = useCallback(async (mood: number, sleep: number) => {
    const ok = await send(() => actions.saveDaily(mood, sleep));
    if (ok) setState((s) => ({ ...s, days: [...s.days.filter((d) => d.day !== s.today), { day: s.today, mood, sleep }] }));
    return ok;
  }, [send]);

  const submitCheckin = useCallback(async (answers: Record<string, number>, causes: string[]) => {
    const ok = await send(() => actions.submitCheckin(answers, causes));
    if (ok) setState((s) => ({ ...s, week: { ...s.week, answers, causes, causeArea: followUpArea(s.week.areas, answers) } }));
    return ok;
  }, [send]);

  const markDone = useCallback((exercise: string) => {
    setState((s) => (s.done.includes(exercise) ? s : { ...s, done: [...s.done, exercise] }));
    void send(() => actions.markExercise(exercise));
  }, [send]);

  const startProgram = useCallback(async (programId: string) => {
    const p = programById(programId);
    if (!p) return null;
    if (state.programs.some((e) => programById(e.program)?.kind === p.kind)) {
      toast(`Kamu sudah punya program ${p.kind} yang berjalan. Hentikan dulu bila ingin menggantinya.`);
      return null;
    }
    let id: string | undefined = `demo-${programId}`;
    if (data.live) {
      try {
        const res = await actions.startProgram(programId);
        if (!res.ok) { toast(res.error); return null; }
        id = res.id;
      } catch {
        toast("Gagal menyimpan di peramban ini.");
        return null;
      }
    }
    if (!id) return null;
    const enrollment = { id, program: programId, startedOn: state.today, paused: false, sessions: [] };
    setState((s) => ({ ...s, programs: [...s.programs, enrollment] }));
    return id;
  }, [data.live, state.programs, state.today, toast]);

  const pauseProgram = useCallback(async (id: string, paused: boolean) => {
    const ok = await send(() => actions.setProgramPaused(id, paused));
    if (ok) setState((s) => ({ ...s, programs: s.programs.map((e) => (e.id === id ? { ...e, paused } : e)) }));
    return ok;
  }, [send]);

  const stopProgram = useCallback(async (id: string) => {
    const ok = await send(() => actions.stopProgram(id));
    if (ok) setState((s) => ({ ...s, programs: s.programs.filter((e) => e.id !== id) }));
    return ok;
  }, [send]);

  const completeSession = useCallback(async (id: string, slot: Slot, practice: string) => {
    const ok = await send(() => actions.completeSession(id, slot));
    if (!ok) return false;
    setState((s) => {
      const mood = s.days.find((d) => d.day === s.today)?.mood ?? null;
      const programs = s.programs.flatMap((e) => {
        if (e.id !== id) return [e];
        const next = { ...e, paused: false, sessions: [...e.sessions.filter((x) => !(x.day === s.today && x.slot === slot)), { day: s.today, slot }] };
        if (programState(next, s.today, mood).finished) {
          logFinishedProgram(e.program, e.startedOn, s.today);
          toast(`Program ${programById(e.program)?.title} selesai. Terima kasih sudah konsisten.`);
          return [];
        }
        return [next];
      });
      return { ...s, programs, done: s.done.includes(practice) ? s.done : [...s.done, practice] };
    });
    return true;
  }, [send, toast]);

  const setEnergyOptIn = useCallback(async (on: boolean) => {
    const ok = await send(() => actions.setEnergyOptIn(on));
    if (ok) setState((s) => ({ ...s, energy: { ...s.energy, optIn: on } }));
    return ok;
  }, [send]);

  const reportPartner = useCallback(async (partnerId: string, reason: string) => {
    const ok = await send(() => actions.reportPartner(partnerId, reason));
    if (ok) setState((s) => ({ ...s, partners: s.partners.filter((p) => p.id !== partnerId) }));
    return ok;
  }, [send]);

  const updateUser = useCallback(async (name: string, teamId: string) => {
    const ok = await send(() => actions.updateProfile(name, teamId));
    if (ok) setState((s) => ({ ...s, user: { ...s.user, name: name.trim(), teamId } }));
    return ok;
  }, [send]);

  const value = useMemo(() => ({
    ...state,
    todayLog: state.days.find((d) => d.day === state.today) ?? null,
    saveDaily, submitCheckin, markDone, startProgram, pauseProgram, stopProgram, completeSession, setEnergyOptIn, reportPartner, updateUser, toastMsg, toast,
  }), [state, saveDaily, submitCheckin, markDone, startProgram, pauseProgram, stopProgram, completeSession, setEnergyOptIn, reportPartner, updateUser, toastMsg, toast]);
  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be used inside <EmployeeProvider>");
  return ctx;
}
