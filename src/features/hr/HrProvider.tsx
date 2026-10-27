"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { makeModel, type Dataset, type Model, type Scope } from "@/lib/model";
import { localDataset } from "@/store/hr";
import type { Result } from "@/store/hr-actions";
import { currentAccount, startApp } from "@/store/cloud";
import { AppLoadError } from "@/components/ui/AppLoadError";

type HrState = {
  /** All numbers of the dashboard: the sample company with HR's local changes. */
  m: Model;
  demo: boolean;
  scope: Scope;
  setScope: (s: Scope) => void;
  toastMsg: string | null;
  toast: (msg: string) => void;
  /** Runs a server action, shows its error (or `done`) as a toast, and resolves to whether it worked. */
  run: (action: () => Promise<Result>, done?: string) => Promise<Result>;
  pending: boolean;
};

const HrContext = createContext<HrState | null>(null);

/** The dashboard reads the sample numbers with the company's own settings on top (from Supabase when signed in). */
export function HrProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The browser copy is filled after the first render: from Supabase when signed in, from this browser in demo mode.
  useEffect(() => {
    let live = true;
    startApp("hr").then((r) => {
      if (!live) return;
      if (r.ready) setDataset(localDataset());
      else if (r.error) setError(r.error);
    });
    return () => { live = false; };
  }, []);
  if (error) return <AppLoadError message={error} />;
  if (!dataset) return <div className="grid min-h-dvh place-items-center text-[16px] text-muted">Memuat dashboard...</div>;
  return <HrState dataset={dataset} reload={() => setDataset(localDataset())}>{children}</HrState>;
}

function HrState({ dataset, reload, children }: { dataset: Dataset; reload: () => void; children: ReactNode }) {
  const m = useMemo(() => makeModel(dataset), [dataset]);
  const [scope, setScope] = useState<Scope>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3600);
  }, []);

  const run = useCallback(async (action: () => Promise<Result>, done?: string) => {
    setPending(true);
    let res: Result;
    try {
      res = await action();
    } catch {
      res = { ok: false, error: "Gagal menyimpan. Coba lagi." };
    }
    setPending(false);
    if (!res.ok) toast(res.error);
    else {
      if (done) toast(done);
      reload();
    }
    return res;
  }, [reload, toast]);

  // A division that no longer exists (or is hidden) falls back to the whole company.
  const safeScope = scope === "all" || m.teamById(scope) ? scope : "all";
  const value = useMemo(() => ({ m, demo: !currentAccount(), scope: safeScope, setScope, toastMsg, toast, run, pending }), [m, safeScope, toastMsg, toast, run, pending]);
  return <HrContext.Provider value={value}>{children}</HrContext.Provider>;
}

export function useHr() {
  const ctx = useContext(HrContext);
  if (!ctx) throw new Error("useHr must be used inside <HrProvider>");
  return ctx;
}
