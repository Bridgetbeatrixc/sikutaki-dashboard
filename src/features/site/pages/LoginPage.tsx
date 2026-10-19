"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { enterDemo, login, type FormState } from "@/server/actions/auth";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const demoButton = "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d2d2d7] px-5 text-[15px] font-medium text-ink transition-colors hover:border-brand hover:text-brand";

/** One sign-in for HR and employees; the account's role decides which side opens. */
export function LoginPage({ notice }: { notice?: "reset" | "hapus" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  return (
    <AuthCard title="Masuk ke Sikutaki" text="Untuk HR dan karyawan."
      footer={
        <div className="grid gap-2">
          <span>Karyawan baru? <Link href={ROUTES.join()} className="font-medium text-brand hover:underline">Gabung dengan kode undangan</Link></span>
          <span>Mendaftarkan perusahaan? <Link href={ROUTES.signup} className="font-medium text-brand hover:underline">Daftar sebagai HR</Link></span>
        </div>
      }>
      {notice === "reset" && <Notice tone="good">Kata sandi sudah diganti. Silakan masuk dengan kata sandi baru.</Notice>}
      {notice === "hapus" && <Notice tone="good">Akun dan seluruh datamu sudah dihapus.</Notice>}
      <form action={action} className="grid gap-5">
        <label className={field}><span className={fieldLabel}>Email</span>
          <input type="email" name="email" required autoComplete="username" placeholder="nama@perusahaan.com" defaultValue={state?.fields?.email} className={fieldInput} />
        </label>
        <label className={field}>
          <span className={fieldLabel}>Kata sandi</span>
          <input type="password" name="password" required autoComplete="current-password" className={fieldInput} />
        </label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Memeriksa..." : "Masuk"}</button>
        <p className="text-[13.5px] leading-normal text-muted">
          Lupa kata sandi? Karyawan bisa meminta tautan reset ke HR perusahaannya. HR bisa <Link href={ROUTES.contact} className="text-brand hover:underline">menghubungi kami</Link>.
        </p>
      </form>
      <div className="grid gap-2.5 rounded-[20px] bg-canvas p-4">
        <b className="text-[15px] font-semibold">Ingin melihat dulu?</b>
        <span className="text-[13.5px] text-muted">Demo memakai perusahaan contoh dan tidak menyimpan apa pun.</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <form action={enterDemo.bind(null, "hr")}><button type="submit" className={demoButton}>Demo dashboard HR</button></form>
          <form action={enterDemo.bind(null, "employee")}><button type="submit" className={demoButton}>Demo aplikasi karyawan</button></form>
        </div>
      </div>
    </AuthCard>
  );
}
