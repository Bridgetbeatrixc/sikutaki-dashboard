"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type EmployeeState = {
  /** Today's mood, 1 (Berat) to 5 (Sangat baik). */
  mood: number | null;
  /** Hours slept last night. */
  sleep: number;
  /** Whether today's mood and sleep have been saved. */
  saved: boolean;
  /** This week's check-in answers per area (0 to 4), or null when not filled yet. */
  checkin: Record<string, number> | null;
  causes: string[];
  /** Exercise ids finished today. */
  done: string[];
  booked: string | null;
};

const INITIAL: EmployeeState = { mood: null, sleep: 7, saved: false, checkin: null, causes: [], done: [], booked: null };

type EmployeeContextValue = EmployeeState & {
  update: (patch: Partial<EmployeeState>) => void;
  reset: () => void;
};

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(INITIAL);
  const update = useCallback((patch: Partial<EmployeeState>) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(INITIAL), []);
  const value = useMemo(() => ({ ...state, update, reset }), [state, update, reset]);
  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be used inside <EmployeeProvider>");
  return ctx;
}
