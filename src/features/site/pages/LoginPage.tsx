"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { supabaseReady } from "@/lib/supabase/config";
import { login, type FormState } from "@/store/account";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const secondary = "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d2d2d7] px-5 text-[15px] font-medium text-ink transition-colors hover:border-brand hover:text-brand";

export type LoginNotice = "sandi" | "kedaluwarsa" | "hapus";
const NOTICES: Record<LoginNotice, { tone: "good" | "bad"; text: string }> = {
  sandi: { tone: "good", text: "Kata sandi sudah diganti. Silakan masuk dengan kata sandi baru." },
  kedaluwarsa: { tone: "bad", text: "Tautan dari email sudah kedaluwarsa atau sudah dipakai. Masuk, atau minta tautan baru." },
  hapus: { tone: "good", text: "Akun dan seluruh datamu sudah dihapus." },
};

/** One sign-in for HR and employees; the account's role decides which app opens. */
export function LoginPage({ next, notice }: { next?: string; notice?: LoginNotice }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  return (
    <AuthCard title="Masuk ke Sikutaki" text="Untuk HR dan karyawan."
      photo={{ src: "/img/auth/masuk.jpg", alt: "Karyawan tersenyum saat bekerja dengan laptop" }}
      footer={
        <div className="grid gap-2">
          <span>Karyawan baru? <Link href={ROUTES.join()} className="font-medium text-brand hover:underline">Gabung dengan kode undangan</Link></span>
          <span>Mendaftarkan perusahaan? <Link href={ROUTES.signup} className="font-medium text-brand hover:underline">Daftar sebagai HR</Link></span>
        </div>
      }>
      {notice && <Notice tone={NOTICES[notice].tone}>{NOTICES[notice].text}</Notice>}
      {!supabaseReady && <Notice>Server belum terhubung ke Supabase, jadi masuk dengan akun belum bisa dipakai. Mode demo di bawah tetap bisa dicoba.</Notice>}
      <form action={action} className="grid gap-5">
        {next && <input type="hidden" name="lanjut" value={next} />}
        <label className={field}><span className={fieldLabel}>Email</span>
          <input type="email" name="email" required autoComplete="username" placeholder="nama@perusahaan.com" defaultValue={state?.fields?.email} className={fieldInput} />
        </label>
        <label className={field}>
          <span className="flex items-baseline justify-between gap-3">
            <span className={fieldLabel}>Kata sandi</span>
            <Link href={ROUTES.forgotPassword} className="text-[13px] text-brand hover:underline">Lupa kata sandi?</Link>
          </span>
          <input type="password" name="password" required minLength={8} autoComplete="current-password" className={fieldInput} />
        </label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Memeriksa..." : "Masuk"}</button>
      </form>
      <div className="grid gap-2.5 rounded-[20px] bg-canvas p-4">
        <b className="text-[15px] font-semibold">Ingin melihat dulu?</b>
        <span className="text-[13.5px] text-muted">Mode demo memakai perusahaan contoh. Isianmu tersimpan di peramban ini saja, tidak dikirim ke server.</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href={ROUTES.demo.hr} className={secondary}>Demo dashboard HR</Link>
          <Link href={ROUTES.demo.employee} className={secondary}>Demo aplikasi karyawan</Link>
        </div>
      </div>
    </AuthCard>
  );
}
