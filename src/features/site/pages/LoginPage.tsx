"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { ROUTES } from "@/lib/paths";
import { pillButton } from "@/features/landing/components/ui";
import { field, fieldInput, fieldLabel } from "../form";
import { ProtoNote } from "../ui";
import { AuthCard } from "./AuthCard";

type Role = "hr" | "employee";

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
      <form onSubmit={submit} className="grid gap-4">
        <Segmented label="Masuk sebagai" value={role} onChange={setRole}
          options={[{ value: "hr", label: "HR" }, { value: "employee", label: "Karyawan" }]} />
        <label className={field}><span className={fieldLabel}>Email kerja</span>
          <input type="email" name="email" autoComplete="username" placeholder="nama@perusahaan.com" className={fieldInput} />
        </label>
        <label className={field}>
          <span className="flex items-center justify-between"><span className={fieldLabel}>Kata sandi</span>
            <Link href={ROUTES.contact} className="text-[13px] text-brand hover:underline">Lupa kata sandi?</Link></span>
          <input type="password" name="password" autoComplete="current-password" className={fieldInput} />
        </label>
        <button type="submit" className={`${pillButton("primary", true)} justify-center`}>Masuk</button>
      </form>
      <ProtoNote>Prototipe: belum ada akun sungguhan. Isian boleh dikosongkan, tombol Masuk langsung membuka demo {role === "hr" ? "dashboard HR" : "aplikasi karyawan"}.</ProtoNote>
    </AuthCard>
  );
}
