"use client";
import Link from "next/link";
import { Card, Fine } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { DAYS_LONG } from "@/lib/week";
import { useHr } from "../HrProvider";
import { InviteCard } from "../InviteCard";

const GHOST_BARS = ["h-[40%]", "h-[55%]", "h-[48%]", "h-[70%]", "h-[62%]", "h-[80%]"];

/** Beranda for a company without results yet: what is done and what is next, from real data. */
export function Onboarding() {
  const { m } = useHr();
  const c = m.COMPANY;
  const steps = [
    { t: "Buat organisasi dan divisi", d: `${m.TEAMS.length} divisi: ${m.TEAMS.map((t) => t.name).join(", ")}`, done: m.TEAMS.length > 0, href: ROUTES.hr.settings },
    { t: "Undang karyawan", d: `${c.employees} karyawan sudah bergabung. Hasil tampil mulai ${c.minGroup} penjawab.`, done: c.employees >= c.minGroup, href: ROUTES.hr.settingsTab("karyawan") },
    { t: "Tambahkan psikolog mitra", d: m.ds.partners.length ? `${m.ds.partners.length} mitra aktif` : "Karyawan bisa menghubungi mitra langsung dari aplikasi", done: m.ds.partners.length > 0, href: ROUTES.hr.settingsTab("mitra") },
    { t: "Check-in pertama", d: `Dibuka setiap ${DAYS_LONG[c.checkinDay]} di aplikasi karyawan, ditutup Minggu 23.59 WIB`, done: false, href: ROUTES.hr.checkin },
  ];
  const n = steps.filter((s) => s.done).length;
  return (
    <>
      <PageHeader title="Selamat datang di Sikutaki" sub={`${c.name} · belum ada hasil check-in`} />
      <div className="grid items-start gap-[18px] xl:grid-cols-[1.6fr_1fr]">
        <div className="grid min-w-0 gap-[18px]">
          <Card title="Persiapan" sub={`${n} dari ${steps.length} langkah selesai`}>
            <div className="h-2.5 overflow-hidden rounded-full bg-track"><span className="block h-full rounded-full bg-brand-2" style={{ width: `${(n / steps.length) * 100}%` }} /></div>
            <ol className="grid">
              {steps.map((s, i) => (
                <li key={s.t} className="grid grid-cols-[30px_1fr_auto] items-center gap-3 border-t border-line py-2.5 first:border-t-0">
                  <span className={cn("inline-flex size-7 items-center justify-center rounded-full border-2 text-[14px] font-bold", s.done ? "border-brand-2 bg-brand-2 text-white" : "border-[#d2d2d7] bg-white text-muted")}>
                    {s.done ? <Icon name="check" size={14} stroke={2.6} /> : i + 1}
                  </span>
                  <div className="min-w-0"><b className={cn(s.done && "text-muted")}>{s.t}</b><small className="block text-muted">{s.d}</small></div>
                  <Link href={s.href} className="inline-flex items-center gap-1 font-semibold text-brand">Buka <Icon name="arrow" size={14} /></Link>
                </li>
              ))}
            </ol>
          </Card>
          <InviteCard />
        </div>
        <Card title="Yang akan muncul di sini">
          <div className="flex h-[120px] items-end gap-2.5 rounded-xl bg-[repeating-linear-gradient(0deg,transparent_0_29px,#eef0f3_29px_30px)] p-2.5">
            {GHOST_BARS.map((h) => <span key={h} className={cn("flex-1 rounded-t-md bg-[#e6e9ef]", h)} />)}
          </div>
          <Fine>Setelah minimal {c.minGroup} karyawan mengisi check-in, Beranda menampilkan indeks wellbeing, partisipasi, mood, jam tidur, dan fokus tiap divisi.</Fine>
        </Card>
      </div>
    </>
  );
}
