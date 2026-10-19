"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { signupHr, type FormState } from "@/server/actions/auth";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const INDUSTRIES = ["Jasa", "Manufaktur", "Teknologi", "Keuangan", "Ritel", "Kesehatan", "Pendidikan", "Pemerintahan", "Lainnya"];

/** HR registers the company: their account, the company and its divisions. */
export function SignupPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(signupHr, undefined);
  const v = state?.fields ?? {};
  return (
    <AuthCard title="Daftarkan perusahaan" text="Untuk HR. Karyawan bergabung nanti lewat kode undangan dari Anda."
      footer={<>Sudah punya akun? <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Masuk</Link></>}>
      <form action={action} className="grid gap-5">
        <label className={field}><span className={fieldLabel}>Nama lengkap</span><input name="name" required autoComplete="name" defaultValue={v.name} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Email kerja</span><input name="email" type="email" required autoComplete="email" placeholder="nama@perusahaan.com" defaultValue={v.email} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Nama perusahaan</span><input name="company" required autoComplete="organization" defaultValue={v.company} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Industri</span>
          <select name="industry" className={fieldInput} defaultValue={v.industry ?? INDUSTRIES[0]}>{INDUSTRIES.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className={field}><span className={fieldLabel}>Divisi, satu per baris</span>
          <textarea name="divisions" required rows={4} defaultValue={v.divisions} placeholder={"Operasional\nLayanan Pelanggan\nKeuangan"} className={`${fieldInput} py-3`} />
          <small className="text-[12.5px] text-muted">Bisa diubah nanti di Pengaturan. Skor sebuah divisi baru tampil bila minimal 5 orang mengisi check-in.</small>
        </label>
        <label className={field}><span className={fieldLabel}>Kata sandi</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /><small className="text-[12.5px] text-muted">Minimal 8 karakter.</small></label>
        <label className="flex items-start gap-2.5 text-[13.5px] text-body">
          <input type="checkbox" required className="mt-0.5 size-4 accent-brand" />
          <span>Saya setuju dengan <Link href={ROUTES.terms} className="text-brand hover:underline">Syarat dan ketentuan</Link> serta <Link href={ROUTES.privacy} className="text-brand hover:underline">Kebijakan privasi</Link>.</span>
        </label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Membuat akun..." : "Buat akun"}</button>
      </form>
    </AuthCard>
  );
}
