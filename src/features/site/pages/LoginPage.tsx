"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { ProtoNote } from "../ui";
import { AuthCard } from "./AuthCard";

type Role = "hr" | "employee";
const ROLES: { value: Role; label: string }[] = [{ value: "hr", label: "Saya HR" }, { value: "employee", label: "Saya karyawan" }];

/** Demo login: there are no real accounts, so signing in just opens the chosen side of the demo. */
export function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("hr");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(role === "hr" ? ROUTES.hr.root : ROUTES.employee.root);
  };

  return (
    <AuthCard title="Masuk ke Sikutaki" text="Pilih akun Anda, lalu masuk."
      footer={<>Belum punya akun? <Link href={ROUTES.signup} className="font-medium text-brand hover:underline">Daftar</Link></>}>
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1" role="radiogroup" aria-label="Masuk sebagai">
          {ROLES.map((r) => (
            <button key={r.value} type="button" role="radio" aria-checked={role === r.value} onClick={() => setRole(r.value)}
              className={cn("rounded-full py-2.5 text-[15px] font-medium transition-colors", role === r.value ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,.1)]" : "text-muted hover:text-ink")}>
              {r.label}
            </button>
          ))}
        </div>
        <label className={field}><span className={fieldLabel}>Email kerja</span>
          <input type="email" name="email" autoComplete="username" placeholder="nama@perusahaan.com" className={fieldInput} />
        </label>
        <label className={field}>
          <span className="flex items-center justify-between"><span className={fieldLabel}>Kata sandi</span>
            <Link href={ROUTES.contact} className="text-[13px] text-brand hover:underline">Lupa kata sandi?</Link></span>
          <input type="password" name="password" autoComplete="current-password" className={fieldInput} />
        </label>
        <button type="submit" className={submitButton}>Masuk</button>
      </form>
      <ProtoNote>Prototipe: belum ada akun sungguhan. Isian boleh dikosongkan, tombol Masuk langsung membuka demo {role === "hr" ? "dashboard HR" : "aplikasi karyawan"}.</ProtoNote>
    </AuthCard>
  );
}
