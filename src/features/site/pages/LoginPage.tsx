"use client";
import Link from "next/link";
import { ROUTES } from "@/lib/paths";
import { submitButton } from "../form";
import { Notice } from "../ui";
import { AuthCard } from "./AuthCard";

const secondary = "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d2d2d7] px-5 text-[15px] font-medium text-ink transition-colors hover:border-brand hover:text-brand";

/** The frontend-only version has no accounts: both apps open straight away with data kept in this browser. */
export function LoginPage() {
  return (
    <AuthCard title="Masuk ke Sikutaki" text="Versi frontend untuk pengujian."
      photo={{ src: "/img/auth/masuk.jpg", alt: "Karyawan tersenyum saat bekerja dengan laptop" }}
      footer={
        <div className="grid gap-2">
          <span>Karyawan baru? <Link href={ROUTES.join()} className="font-medium text-brand hover:underline">Isi nama dan divisi</Link></span>
          <span>Ingin mengganti nama perusahaan? <Link href={ROUTES.signup} className="font-medium text-brand hover:underline">Daftar sebagai HR</Link></span>
        </div>
      }>
      <Notice>Versi ini tidak memakai akun atau server. Semua isian tersimpan di peramban ini saja, dan dashboard HR memakai angka perusahaan contoh.</Notice>
      <div className="grid gap-2.5">
        <Link href={ROUTES.hr.root} className={submitButton}>Buka dashboard HR</Link>
        <Link href={ROUTES.employee.root} className={secondary}>Buka aplikasi karyawan</Link>
      </div>
    </AuthCard>
  );
}
