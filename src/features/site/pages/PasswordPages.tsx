"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { requestReset, setNewPassword, type FormState } from "@/store/account";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const photo = { src: "/img/auth/masuk.jpg", alt: "Karyawan tersenyum saat bekerja dengan laptop" };
const back = <>Ingat kata sandinya? <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Masuk</Link></>;

/** Ask Supabase to email a link for choosing a new password. */
export function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestReset, undefined);
  return (
    <AuthCard title="Lupa kata sandi" text="Kami kirim tautan untuk membuat kata sandi baru ke email akunmu." photo={photo} footer={back}>
      {state?.notice ? <Notice tone="good">{state.notice}</Notice> : (
        <form action={action} className="grid gap-5">
          <label className={field}><span className={fieldLabel}>Email</span>
            <input type="email" name="email" required autoComplete="email" placeholder="nama@perusahaan.com" defaultValue={state?.fields?.email} className={fieldInput} />
          </label>
          {state?.error && <Notice tone="bad">{state.error}</Notice>}
          <button type="submit" disabled={pending} className={submitButton}>{pending ? "Mengirim..." : "Kirim tautan"}</button>
        </form>
      )}
    </AuthCard>
  );
}

/** Opened from the email link: the user is signed in for this step and picks a new password. */
export function NewPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(setNewPassword, undefined);
  return (
    <AuthCard title="Buat kata sandi baru" text="Minimal 8 karakter. Setelah disimpan, masuk lagi dengan kata sandi baru." photo={photo} footer={back}>
      <form action={action} className="grid gap-5">
        <label className={field}><span className={fieldLabel}>Kata sandi baru</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Ulangi kata sandi baru</span><input name="again" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /></label>
        {state?.error && <Notice tone="bad">{state.error} {state.error.includes("kedaluwarsa") && <Link href={ROUTES.forgotPassword} className="underline">Minta tautan baru</Link>}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Menyimpan..." : "Simpan kata sandi"}</button>
      </form>
    </AuthCard>
  );
}
