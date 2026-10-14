"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { pillButton } from "@/features/landing/components/ui";
import { field, fieldInput, fieldLabel } from "../form";
import { ProtoNote } from "../ui";
import { AuthCard } from "./AuthCard";

/** Demo sign-up for a company: nothing is stored, the dashboard then opens as a brand-new organisation. */
export function SignupPage() {
  const [company, setCompany] = useState<string | null>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCompany(String(new FormData(e.currentTarget).get("company") || "Perusahaan Anda"));
  };

  if (company) {
    return (
      <AuthCard title="Akun demo siap" text={`Selamat datang, ${company}.`}
        footer={<Link href={ROUTES.home} className="font-medium text-brand hover:underline">Kembali ke beranda</Link>}>
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-mint text-brand"><Icon name="check" size={28} stroke={2.4} /></span>
        <p className="text-center text-[15px] text-body">
          Dashboard akan terbuka sebagai organisasi baru, belum ada hasil check-in. Ikuti langkah awal untuk mengundang tim pertama.
        </p>
        <Link href={ROUTES.hr.newOrg} className={`${pillButton("primary", true)} justify-center`}>Buka dashboard HR</Link>
        <ProtoNote>Prototipe: tidak ada data yang disimpan.</ProtoNote>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Daftarkan perusahaan" text="Mulai dengan pilot 3 bulan bersama satu tim."
      footer={<>Sudah punya akun? <Link href={ROUTES.login} className="font-medium text-brand hover:underline">Masuk</Link></>}>
      <form onSubmit={submit} className="grid gap-4">
        <label className={field}><span className={fieldLabel}>Nama lengkap</span><input name="name" required autoComplete="name" className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Email kerja</span><input name="email" type="email" required autoComplete="email" placeholder="nama@perusahaan.com" className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Nama perusahaan</span><input name="company" required autoComplete="organization" className={fieldInput} /></label>
        <label className={field}><span className={fieldLabel}>Jumlah karyawan</span>
          <select name="size" className={fieldInput} defaultValue="50–200">
            {["Kurang dari 50", "50–200", "200–1.000", "Lebih dari 1.000"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className={field}><span className={fieldLabel}>Kata sandi</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldInput} /></label>
        <label className="flex items-start gap-2.5 text-[13.5px] text-body">
          <input type="checkbox" required className="mt-0.5 size-4 accent-brand" />
          <span>Saya setuju dengan <Link href={ROUTES.terms} className="text-brand hover:underline">Syarat dan ketentuan</Link> serta <Link href={ROUTES.privacy} className="text-brand hover:underline">Kebijakan privasi</Link>.</span>
        </label>
        <button type="submit" className={`${pillButton("primary", true)} justify-center`}>Buat akun</button>
      </form>
      <ProtoNote>Prototipe: akun tidak benar-benar dibuat dan tidak ada data yang dikirim.</ProtoNote>
    </AuthCard>
  );
}
