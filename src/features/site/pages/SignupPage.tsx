"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { signupHr, type FormState } from "@/store/account";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const INDUSTRIES = ["Jasa", "Manufaktur", "Teknologi", "Keuangan", "Ritel", "Kesehatan", "Pendidikan", "Pemerintahan", "Lainnya"];

/** HR registers the company: their account, the company and its divisions. */
export function SignupPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(signupHr, undefined);
  const v = state?.fields ?? {};
  return (
    <AuthCard title="Daftarkan perusahaan" text="Versi frontend: nama Anda dan perusahaan tersimpan di peramban ini. Angka dashboard memakai 8 divisi perusahaan contoh."
      footer={<>Ingin langsung melihat? <Link href={ROUTES.hr.root} className="font-medium text-brand hover:underline">Buka dashboard HR</Link></>}>
      <form action={action} className="grid gap-5">
        <label className={field}><span className={fieldLabel}>Nama lengkap</span><input name="name" required autoComplete="name" defaultValue={v.name} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Email kerja</span><input name="email" type="email" autoComplete="email" placeholder="nama@perusahaan.com" defaultValue={v.email} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Nama perusahaan</span><input name="company" required autoComplete="organization" defaultValue={v.company} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Industri</span>
          <select name="industry" className={fieldInput} defaultValue={v.industry ?? INDUSTRIES[0]}>{INDUSTRIES.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="flex items-start gap-2.5 text-[13.5px] text-body">
          <input type="checkbox" required className="mt-0.5 size-4 accent-brand" />
          <span>Saya setuju dengan <Link href={ROUTES.terms} className="text-brand hover:underline">Syarat dan ketentuan</Link> serta <Link href={ROUTES.privacy} className="text-brand hover:underline">Kebijakan privasi</Link>.</span>
        </label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Membuka..." : "Buka dashboard"}</button>
      </form>
    </AuthCard>
  );
}
