"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DEMO_COOKIE } from "@/lib/supabase/config";
import { ROUTES } from "@/lib/paths";

/** /demo/hr and /demo/karyawan: open an app with the sample company, no account needed. */
export default function DemoPage() {
  const { app } = useParams<{ app: string }>();
  useEffect(() => {
    document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
    window.location.replace(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${app === "hr" ? ROUTES.hr.root : ROUTES.employee.root}`);
  }, [app]);
  return <div className="grid min-h-dvh place-items-center text-sm text-muted">Membuka demo...</div>;
}
