"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { pillButton } from "@/features/landing/components/ui";
import { DEMO_EMAIL } from "@/features/landing/content";
import { field, fieldInput, fieldLabel } from "../form";
import { Band, PageIntro, Tile } from "../ui";

const TOPICS = ["Pilot 3 bulan", "Demo produk", "Keamanan dan privasi", "Menjadi psikolog mitra", "Lainnya"];

/** No backend yet: the form opens the visitor's email app with everything filled in. */
export function ContactPage() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `[${f.get("topic")}] ${f.get("company")}`;
    const body = [`Nama: ${f.get("name")}`, `Email: ${f.get("email")}`, `Perusahaan: ${f.get("company")}`, `Jumlah karyawan: ${f.get("size")}`, "", String(f.get("message"))].join("\n");
    window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <PageIntro eyebrow="Kontak" title="Mari bicara." text="Ceritakan tim Anda. Kami biasanya membalas dalam dua hari kerja." />
      <Band tone="grey">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form onSubmit={submit} className="grid gap-4 rounded-[28px] bg-white p-6 sm:grid-cols-2 sm:p-9">
            <label className={field}><span className={fieldLabel}>Nama</span><input name="name" required autoComplete="name" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Email kerja</span><input name="email" type="email" required autoComplete="email" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Perusahaan</span><input name="company" required autoComplete="organization" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Jumlah karyawan</span>
              <select name="size" className={fieldInput} defaultValue="50–200">
                {["Kurang dari 50", "50–200", "200–1.000", "Lebih dari 1.000"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className={cn(field, "sm:col-span-2")}><span className={fieldLabel}>Topik</span>
              <select name="topic" className={fieldInput}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
            </label>
            <label className={cn(field, "sm:col-span-2")}><span className={fieldLabel}>Pesan</span>
              <textarea name="message" rows={5} required className={cn(fieldInput, "py-3")} placeholder="Apa yang ingin Anda ketahui?" />
            </label>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <button type="submit" className={pillButton("primary", true)}>Kirim pesan</button>
              {sent && <span role="status" className="text-[14px] text-muted">Aplikasi email Anda terbuka dengan pesan yang sudah terisi.</span>}
            </div>
          </form>
          <div className="grid content-start gap-4">
            <Tile icon="mail" title="Email">
              <a href={`mailto:${DEMO_EMAIL}`} className="text-brand hover:underline">{DEMO_EMAIL}</a>
            </Tile>
            <Tile icon="phone" title="Butuh bantuan segera?">
              Sikutaki bukan layanan krisis. Hubungi Healing119 di 119 ekstensi 8, atau 112 dalam keadaan darurat.
            </Tile>
          </div>
        </div>
      </Band>
    </>
  );
}
