"use client";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { makeModel, type Dataset, type Model, type Scope } from "@/lib/model";
import { sampleDataset } from "@/lib/sample";
import type { Result } from "@/server/actions/hr";

type HrState = {
  /** All numbers of the dashboard, from the server's dataset or the demo company. */
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

export function HrProvider({ dataset, children }: { dataset: Dataset | null; children: ReactNode }) {
  const router = useRouter();
  const m = useMemo(() => makeModel(dataset ?? sampleDataset()), [dataset]);
  const [scope, setScope] = useState<Scope>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3600);
  }, []);

  const run = useCallback(async (action: () => Promise<Result>, done?: string) => {
    let res: Result;
    try {
      res = await action();
    } catch {
      res = { ok: false, error: "Gagal tersambung ke server. Coba lagi." };
    }
    if (!res.ok) toast(res.error);
    else {
      if (done) toast(done);
      startTransition(() => router.refresh());
    }
    return res;
  }, [router, toast]);

  // A division that no longer exists (or is hidden) falls back to the whole company.
  const safeScope = scope === "all" || m.teamById(scope) ? scope : "all";
  const value = useMemo(() => ({ m, demo: !dataset, scope: safeScope, setScope, toastMsg, toast, run, pending }), [m, dataset, safeScope, toastMsg, toast, run, pending]);
  return <HrContext.Provider value={value}>{children}</HrContext.Provider>;
}

export function useHr() {
  const ctx = useContext(HrContext);
  if (!ctx) throw new Error("useHr must be used inside <HrProvider>");
  return ctx;
}
