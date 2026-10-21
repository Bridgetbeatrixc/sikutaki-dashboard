"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ROUTES } from "@/lib/paths";
import { sampleDataset } from "@/lib/sample";
import { signupEmployee, type FormState } from "@/store/account";
import { loadHr } from "@/store/hr";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

/** Frontend-only version: an employee picks a name and a division of the sample company. */
export function JoinPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(signupEmployee, undefined);
  const [company, setCompany] = useState({ name: "", teams: sampleDataset().teams.map((t) => ({ id: t.id, name: t.name })) });
  useEffect(() => {
    const hr = loadHr();
    setCompany({ name: hr.company.name, teams: sampleDataset().teams.map((t) => ({ id: t.id, name: hr.teamNames[t.id] ?? t.name })) });
  }, []);
  const v = state?.fields ?? {};
  return (
    <AuthCard title={company.name ? `Gabung dengan ${company.name}` : "Gabung"} text="Versi frontend: tanpa akun, datamu tersimpan di peramban ini."
      footer={<>Ingin langsung mencoba? <Link href={ROUTES.employee.root} className="font-medium text-brand hover:underline">Buka aplikasi karyawan</Link></>}>
      <form action={action} className="grid gap-5">
        <label className={field}><span className={fieldLabel}>Nama panggilan</span><input name="name" required autoComplete="given-name" defaultValue={v.name} className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Divisi</span>
          <select name="team" required defaultValue={v.team ?? ""} className={fieldInput}>
            <option value="" disabled>Pilih divisimu</option>
            {company.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="flex items-start gap-2.5 text-[13.5px] text-body">
          <input type="checkbox" required className="mt-0.5 size-4 accent-brand" />
          <span>Saya setuju dengan <Link href={ROUTES.terms} className="text-brand hover:underline">Syarat dan ketentuan</Link> serta <Link href={ROUTES.privacy} className="text-brand hover:underline">Kebijakan privasi</Link>.</span>
        </label>
        {state?.error && <Notice tone="bad">{state.error}</Notice>}
        <button type="submit" disabled={pending} className={submitButton}>{pending ? "Membuka..." : "Mulai"}</button>
      </form>
    </AuthCard>
  );
}
