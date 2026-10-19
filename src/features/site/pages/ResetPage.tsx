"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { resetPassword, type FormState } from "@/server/actions/auth";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

export function ResetPage({ token, valid }: { token: string; valid: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  const footer = <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Kembali ke halaman masuk</Link>;
  if (!valid) {
    return (
      <AuthCard title="Tautan tidak berlaku" text="Tautan reset hanya bisa dipakai sekali dan berlaku 3 hari." footer={footer}>
        <Notice>Minta tautan baru ke HR perusahaanmu.</Notice>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Buat kata sandi baru" text="Setelah ini, semua sesi lama otomatis keluar." footer={footer}>
      <form action={action} className="grid gap-5">
        <input type="hidden" name="token" value={token} />
        <label className={field}><span className={fieldLabel}>Kata sandi baru</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Ulangi kata sandi</span><input name="password2" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /></label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>Simpan kata sandi</button>
      </form>
    </AuthCard>
  );
}
