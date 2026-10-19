"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { followUpArea } from "@/lib/catalog";
import * as actions from "@/server/actions/employee";
import type { EmployeeData } from "@/server/employee";

/*
 * The employee's own data: loaded on the server, then kept here so the app responds at once.
 * Every change is sent to the server; the demo keeps it in the browser only.
 */

type Day = EmployeeData["days"][number];

type EmployeeContextValue = EmployeeData & {
  /** Today's mood and sleep, once saved. */
  todayLog: Day | null;
  saveDaily: (mood: number, sleep: number) => Promise<boolean>;
  submitCheckin: (answers: Record<string, number>, causes: string[]) => Promise<boolean>;
  markDone: (exercise: string) => void;
  toastMsg: string | null;
  toast: (msg: string) => void;
};

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

export function EmployeeProvider({ data, children }: { data: EmployeeData; children: ReactNode }) {
  const [state, setState] = useState(data);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Fresh server data (after a refresh) replaces the local copy.
  useEffect(() => setState(data), [data]);

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
      toast("Gagal tersambung ke server. Periksa koneksi lalu coba lagi.");
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

  const value = useMemo(() => ({
    ...state,
    todayLog: state.days.find((d) => d.day === state.today) ?? null,
    saveDaily, submitCheckin, markDone, toastMsg, toast,
  }), [state, saveDaily, submitCheckin, markDone, toastMsg, toast]);
  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be used inside <EmployeeProvider>");
  return ctx;
}
