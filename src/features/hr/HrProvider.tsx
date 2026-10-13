"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Scope } from "@/lib/data";
import { INITIAL_NOTES, type Note } from "@/lib/focus";

type HrState = {
  scope: Scope;
  setScope: (s: Scope) => void;
  notes: Note[];
  addNote: (n: Omit<Note, "id">) => void;
  /** Demo switch: show the dashboard as a brand-new organisation with no results yet. */
  empty: boolean;
  setEmpty: (v: boolean) => void;
  toastMsg: string | null;
  toast: (msg: string) => void;
};

const HrContext = createContext<HrState | null>(null);

export function HrProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<Scope>("all");
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [empty, setEmpty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3200);
  }, []);
  const addNote = useCallback((n: Omit<Note, "id">) => setNotes((ns) => [...ns, { ...n, id: `n${Date.now()}` }]), []);

  const value = useMemo(() => ({ scope, setScope, notes, addNote, empty, setEmpty, toastMsg, toast }), [scope, notes, addNote, empty, toastMsg, toast]);
  return <HrContext.Provider value={value}>{children}</HrContext.Provider>;
}

export function useHr() {
  const ctx = useContext(HrContext);
  if (!ctx) throw new Error("useHr must be used inside <HrProvider>");
  return ctx;
}
