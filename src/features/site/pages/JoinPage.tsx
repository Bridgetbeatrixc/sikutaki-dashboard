"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ROUTES } from "@/lib/paths";
import { signupEmployee, type FormState } from "@/server/actions/auth";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

type Company = { name: string; teams: { id: string; name: string }[] };

/** Employees join their company with the invite code HR shared. */
export function JoinPage({ code, company, noDatabase }: { code: string; company: Company | null; noDatabase: boolean }) {
  const footer = <>Sudah punya akun? <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Masuk</Link></>;

  if (!company) {
    return (
      <AuthCard title="Gabung dengan tim Anda" text="Masukkan kode undangan dari HR perusahaan Anda." footer={footer}>
        <form method="get" action={ROUTES.join()} className="grid gap-5">
          <label className={field}><span className={fieldLabel}>Kode undangan</span>
            <input name="kode" required defaultValue={code} autoCapitalize="characters" autoComplete="off" placeholder="Contoh: K7M2QX9P" className={`${fieldInput} uppercase tracking-[0.15em]`} />
          </label>
          {code && !noDatabase && <Notice tone="bad">Kode {code} tidak ditemukan. Periksa lagi, atau minta kode terbaru ke HR.</Notice>}
          {noDatabase && <Notice>Pendaftaran belum bisa dipakai karena server belum terhubung ke database.</Notice>}
          <button type="submit" className={submitButton}>Lanjut</button>
        </form>
      </AuthCard>
    );
  }
  return <JoinForm code={code} company={company} footer={footer} />;
}

function JoinForm({ code, company, footer }: { code: string; company: Company; footer: React.ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signupEmployee, undefined);
  const v = state?.fields ?? {};
  return (
    <AuthCard title={`Gabung dengan ${company.name}`} text="Buat akunmu. Jawaban check-in per orang tidak pernah dikirim ke HR." footer={footer}>
      <form action={action} className="grid gap-5">
        <input type="hidden" name="code" value={code} />
        <label className={field}><span className={fieldLabel}>Nama panggilan</span><input name="name" required autoComplete="given-name" defaultValue={v.name} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Email</span><input name="email" type="email" required autoComplete="email" defaultValue={v.email} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Divisi</span>
          <select name="team" required defaultValue={v.team ?? ""} className={fieldInput}>
            <option value="" disabled>Pilih divisimu</option>
            {company.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
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
