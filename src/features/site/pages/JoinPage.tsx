"use client";
import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { ROUTES } from "@/lib/paths";
import { supabaseReady } from "@/lib/supabase/config";
import { companyByInvite, signupEmployee, type FormState, type InviteCompany } from "@/store/account";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const photo = { src: "/img/auth/daftar.jpg", alt: "Rekan kerja tersenyum bersama di kantor" };

/** Employees join their company with the invite code HR shared: first the code, then the account. */
export function JoinPage({ code }: { code: string }) {
  const [company, setCompany] = useState<InviteCompany | null | undefined>(code ? undefined : null);
  useEffect(() => {
    let live = true;
    if (code) companyByInvite(code).then((c) => { if (live) setCompany(c); }).catch(() => { if (live) setCompany(null); });
    return () => { live = false; };
  }, [code]);
  const footer = <>Sudah punya akun? <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Masuk</Link></>;

  if (company === undefined) {
    return <AuthCard title="Gabung dengan tim Anda" text="Memeriksa kode undangan..." photo={photo} footer={footer}>{null}</AuthCard>;
  }
  if (!company) {
    return (
      <AuthCard title="Gabung dengan tim Anda" text="Masukkan kode undangan dari HR perusahaan Anda." photo={photo} footer={footer}>
        <form method="get" action={ROUTES.join()} className="grid gap-5">
          <label className={field}><span className={fieldLabel}>Kode undangan</span>
            <input name="kode" required defaultValue={code} autoCapitalize="characters" autoComplete="off" placeholder="Contoh: K7M2QX9P" className={`${fieldInput} uppercase tracking-[0.15em]`} />
          </label>
          {code && supabaseReady && <Notice tone="bad">Kode {code.toUpperCase()} tidak ditemukan. Periksa lagi, atau minta kode terbaru ke HR.</Notice>}
          {!supabaseReady && <Notice>Pendaftaran belum bisa dipakai karena server belum terhubung ke Supabase.</Notice>}
          <button type="submit" className={submitButton}>Lanjut</button>
        </form>
        <span className="text-[13.5px] text-muted">Ingin mencoba tanpa akun? <Link href={ROUTES.demo.employee} className="text-brand hover:underline">Buka demo aplikasi karyawan</Link></span>
      </AuthCard>
    );
  }
  return <JoinForm code={code} company={company} footer={footer} />;
}

function JoinForm({ code, company, footer }: { code: string; company: InviteCompany; footer: ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signupEmployee, undefined);
  const v = state?.fields ?? {};
  return (
    <AuthCard title={`Gabung dengan ${company.name}`} text="Buat akunmu. Jawaban check-in per orang tidak pernah dikirim ke HR." photo={photo} footer={footer}>
      {state?.notice ? <Notice tone="good">{state.notice}</Notice> : (
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
      )}
    </AuthCard>
  );
}
