"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";

const STEPS = [
  { t: "Buat organisasi dan divisi", d: "8 divisi sudah dibuat", href: ROUTES.hr.settings },
  { t: "Unggah daftar karyawan", d: "490 email terdaftar", href: ROUTES.hr.settings },
  { t: "Atur jadwal check-in", d: "Pilih hari dan jam kirim", href: ROUTES.hr.checkin },
  { t: "Periksa pengaturan privasi", d: "Ambang 5 orang, masa simpan data", href: ROUTES.hr.settings },
  { t: "Kirim check-in pertama", d: "Hasil pertama tampil Senin, setelah check-in ditutup", href: "" },
];
const GHOST_BARS = ["h-[40%]", "h-[55%]", "h-[48%]", "h-[70%]", "h-[62%]", "h-[80%]"];

/** Beranda for a brand-new organisation: setup checklist instead of numbers. */
export function Onboarding() {
  const { setEmpty } = useHr();
  const [done, setDone] = useState([true, true, false, false, false]);
  const n = done.filter(Boolean).length;
  return (
    <>
      <PageHeader title="Selamat datang di Sikutaki" sub="Organisasi baru · belum ada hasil check-in"
        action={<Button variant="soft" onClick={() => setEmpty(false)}>Lihat contoh data</Button>} />
      <div className="grid items-start gap-[18px] xl:grid-cols-[1.6fr_1fr]">
        <Card title="Persiapan" sub={`${n} dari ${STEPS.length} langkah selesai`}>
          <div className="h-2.5 overflow-hidden rounded-full bg-track"><span className="block h-full rounded-full bg-brand-2" style={{ width: `${(n / STEPS.length) * 100}%` }} /></div>
          <ol className="grid">
            {STEPS.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[30px_1fr_auto] items-center gap-3 border-t border-line py-2.5 first:border-t-0">
                <button type="button" aria-label={done[i] ? "Tandai belum" : "Tandai selesai"} onClick={() => setDone(done.map((v, k) => (k === i ? !v : v)))}
                  className={cn("inline-flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold", done[i] ? "border-brand-2 bg-brand-2 text-white" : "border-[#d2d2d7] bg-white text-muted")}>
                  {done[i] ? <Icon name="check" size={14} stroke={2.6} /> : i + 1}
                </button>
                <div><b className={cn(done[i] && "text-muted line-through")}>{s.t}</b><small className="block text-muted">{s.d}</small></div>
                {s.href && <Link href={s.href} className="inline-flex items-center gap-1 font-semibold text-brand">Buka <Icon name="arrow" size={14} /></Link>}
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Yang akan muncul di sini">
          <div className="flex h-[120px] items-end gap-2.5 rounded-xl bg-[repeating-linear-gradient(0deg,transparent_0_29px,#eef0f3_29px_30px)] p-2.5">
            {GHOST_BARS.map((h) => <span key={h} className={cn("flex-1 rounded-t-md bg-[#e6e9ef]", h)} />)}
          </div>
          <Fine>Setelah check-in pertama ditutup, Beranda menampilkan indeks wellbeing, partisipasi, mood, jam tidur, dan fokus tiap divisi.</Fine>
        </Card>
      </div>
    </>
  );
}
