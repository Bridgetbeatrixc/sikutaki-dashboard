"use client";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { enterDemo } from "@/server/actions/auth";
import { submitButton } from "./form";

/** Submits itself on load; the button is there when JavaScript is off. */
export function OpenDemo({ role }: { role: "hr" | "employee" }) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => form.current?.requestSubmit(), []);
  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6 text-center">
      <form ref={form} action={enterDemo.bind(null, role)} className="grid justify-items-center gap-5">
        <Logo size={36} className="text-[22px]" />
        <p className="text-[17px] text-muted">Membuka demo {role === "hr" ? "dashboard HR" : "aplikasi karyawan"} dengan perusahaan contoh...</p>
        <button type="submit" className={submitButton}>Buka demo</button>
      </form>
    </main>
  );
}
