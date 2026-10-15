"use client";
import { useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { DEMO_EMAIL } from "@/features/landing/content";
import { field, fieldInput, fieldLabel, submitButton } from "../form";
import { Band, GradientIcon, PageHero } from "../ui";

const TOPICS = ["Pilot 3 bulan", "Demo produk", "Keamanan & privasi", "Menjadi psikolog mitra", "Lainnya"];
const SIZES = ["Kurang dari 50", "50–200", "200–1.000", "Lebih dari 1.000"];

const INFO: { icon: IconName; title: string; body: React.ReactNode }[] = [
  { icon: "mail", title: "Email", body: <a href={`mailto:${DEMO_EMAIL}`} className="font-medium text-brand hover:underline">{DEMO_EMAIL}</a> },
  { icon: "calendar", title: "Demo dan pilot", body: "Kami tunjukkan dashboard HR dan aplikasi karyawan, lalu membahas pilot 3 bulan untuk satu tim." },
  { icon: "shield", title: "Pertanyaan keamanan", body: "Pilih topik Keamanan & privasi, dan kami jelaskan aturan data untuk perusahaan Anda." },
];

/** No backend yet: the form opens the visitor's email app with everything filled in. */
export function ContactPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `[${topic}] ${f.get("company")}`;
    const body = [`Nama: ${f.get("name")}`, `Email: ${f.get("email")}`, `Perusahaan: ${f.get("company")}`, `Jumlah karyawan: ${f.get("size")}`, "", String(f.get("message"))].join("\n");
    window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <PageHero icon="chat" eyebrow="Kontak" title="Mari bicara." text="Ceritakan tentang tim Anda, dan kami akan membalas lewat email." />

      <Band tone="grey">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-8">
          <div className="grid content-start gap-4">
            {INFO.map((i) => (
              <div key={i.title} className="flex gap-4 rounded-[28px] bg-white p-6">
                <GradientIcon name={i.icon} />
                <div className="grid gap-1">
                  <b className="text-[17px] font-semibold text-ink">{i.title}</b>
                  <div className="text-[15px] leading-relaxed text-muted">{i.body}</div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 rounded-[28px] bg-bad-bg p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-bad"><Icon name="phone" size={22} /></span>
              <div className="grid gap-1">
                <b className="text-[17px] font-semibold text-ink">Butuh bantuan segera?</b>
                <p className="text-[15px] leading-relaxed text-body">Sikutaki bukan layanan krisis. Hubungi Healing119 di 119 ekstensi 8, atau 112 dalam keadaan darurat.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="grid content-start gap-5 rounded-[32px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,.04)] sm:grid-cols-2 sm:p-10">
            <div className="grid gap-2.5 sm:col-span-2">
              <span className={fieldLabel}>Topik</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topik">
                {TOPICS.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={topic === t} onClick={() => setTopic(t)}
                    className={cn("rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
                      topic === t ? "bg-brand text-white" : "bg-canvas text-body hover:bg-[#e8e8ed]")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <label className={field}><span className={fieldLabel}>Nama</span><input name="name" required autoComplete="name" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Email kerja</span><input name="email" type="email" required autoComplete="email" placeholder="nama@perusahaan.com" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Perusahaan</span><input name="company" required autoComplete="organization" className={fieldInput} /></label>
            <label className={field}><span className={fieldLabel}>Jumlah karyawan</span>
              <select name="size" className={fieldInput} defaultValue={SIZES[1]}>{SIZES.map((o) => <option key={o}>{o}</option>)}</select>
            </label>
            <label className={cn(field, "sm:col-span-2")}><span className={fieldLabel}>Pesan</span>
              <textarea name="message" rows={5} required className={cn(fieldInput, "py-3")} placeholder="Apa yang ingin Anda ketahui?" />
            </label>
            <div className="grid gap-3 sm:col-span-2 sm:flex sm:items-center sm:gap-5">
              <button type="submit" className={submitButton}>Kirim pesan <Icon name="arrow" size={18} /></button>
              <span role="status" className="text-[14px] text-muted">
                {sent ? "Aplikasi email Anda terbuka dengan pesan yang sudah terisi." : "Tombol ini membuka aplikasi email Anda."}
              </span>
            </div>
          </form>
        </div>
      </Band>
    </>
  );
}
