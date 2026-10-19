"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { inputClass } from "@/components/ui/form";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { fitRange, LineChart } from "@/components/charts/LineChart";
import { MiniBars } from "@/components/charts/MiniBars";
import { cn } from "@/lib/cn";
import { areaById, NOTE_LABEL } from "@/lib/catalog";
import { listJoin } from "@/lib/format";
import { asset } from "@/lib/paths";
import { monthLabel, MONTHS } from "@/lib/week";
import { useHr } from "../HrProvider";

function ReportKpi({ label, value, foot, tone }: { label: string; value: React.ReactNode; foot: string; tone?: "good" | "bad" }) {
  return (
    <div className="grid min-w-0 gap-0.5 rounded-[14px] bg-canvas p-3.5">
      <small className="text-xs text-muted">{label}</small>
      <b className="num text-[26px] text-head">{value}</b>
      <em className={cn("truncate text-xs not-italic", tone === "good" ? "font-semibold text-good" : tone === "bad" ? "font-semibold text-bad" : "text-muted")}>{foot}</em>
    </div>
  );
}

/** Monthly summary for the board, generated from aggregate data only. */
export function ReportsPage() {
  const { m } = useHr();
  // Each month reports on its last week with results; newest month first.
  const months: { label: string; w: number }[] = [];
  m.WEEKS.forEach((wk, w) => {
    if (w > m.NOW || m.wellbeing("all", w) === null) return;
    const label = monthLabel(wk.start), found = months.find((x) => x.label === label);
    if (found) found.w = w; else months.push({ label, w });
  });
  months.reverse();
  const [pick, setPick] = useState(months[0]?.label ?? "");
  const month = months.find((x) => x.label === pick) ?? months[0];
  if (!month) return null;
  const w = month.w;
  const wb = m.wellbeing("all", w) ?? 0, wb4 = m.wellbeing("all", w - 4);
  const mv = m.movers("all", w);
  const rising = mv.filter((x) => x.d > 0).slice(0, 2);
  const improving = mv.filter((x) => x.d < 0).slice(-2).reverse();
  const areaAlerts = m.alerts(w).filter((a) => a.kind !== "partisipasi");
  const alertTeams = [...new Set(areaAlerts.map((a) => m.teamById(a.team)?.name ?? "Divisi"))];
  const series = m.wellbeingSeries("all").map((v, i) => (i <= w ? v : null));
  const monthKey = m.WEEKS[w].start.slice(0, 7);
  const done = m.ds.notes.filter((n) => n.type === "dilakukan" && n.week >= 0 && m.WEEKS[n.week].start.slice(0, 7) === monthKey).length;
  const refs = m.REFERRALS.byMonth[m.REFERRALS.months.indexOf(MONTHS[Number(monthKey.slice(5, 7)) - 1])] ?? 0;

  return (
    <>
      <div className="print:hidden"><PageHeader title="Laporan" sub="Ringkasan bulanan untuk direksi, dibuat otomatis dari data agregat"
        action={
          <div className="flex flex-wrap gap-2.5">
            <select aria-label="Bulan laporan" className={inputClass} value={month.label} onChange={(e) => setPick(e.target.value)}>
              {months.map((x) => <option key={x.label}>{x.label}</option>)}
            </select>
            <Button onClick={() => window.print()}><Icon name="download" size={16} />Simpan sebagai PDF</Button>
          </div>
        } /></div>
      <div className="grid gap-5 rounded-[20px] print:border-0 print:p-0 print:shadow-none border border-line bg-white p-4 shadow-lg shadow-ink/5 sm:p-7">
        <div className="flex items-center justify-between border-b-2 border-brand pb-3.5">
          <div><small className="text-muted">Laporan kesehatan mental karyawan</small><h2 className="text-[22px] font-bold">{m.COMPANY.name} · {month.label}</h2></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logo.png")} alt="" width={36} height={36} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          <ReportKpi label="Indeks wellbeing" value={wb} foot={wb4 === null ? "belum ada pembanding" : `${wb >= wb4 ? "+" : ""}${wb - wb4} vs 4 minggu sebelumnya`} tone={wb4 === null ? undefined : wb >= wb4 ? "good" : "bad"} />
          <ReportKpi label="Partisipasi" value={`${m.participation("all", w)}%`} foot={`minggu ${m.WEEKS[w].label}, ${m.COMPANY.employees} karyawan`} />
          <ReportKpi label="Langkah HR dilakukan" value={done} foot={`${NOTE_LABEL.dilakukan}, dari catatan HR`} />
          <ReportKpi label="Kontak psikolog" value={refs} foot="jumlah karyawan, anonim" />
        </div>
        <div className="grid gap-3.5 xl:grid-cols-[1.2fr_1fr_0.7fr]">
          <Card title="Ringkasan">
            <ul className="grid list-disc gap-1.5 pl-[18px]">
              <li>{wb4 === null ? `Indeks wellbeing perusahaan ${wb} dari 100.` : `Wellbeing perusahaan ${wb >= wb4 ? "naik" : "turun"} ${Math.abs(wb - wb4)} poin dalam 4 minggu terakhir.`}</li>
              {rising.length > 0 && <li>Area yang paling naik: {listJoin(rising.map((m) => `${m.area.name} (+${m.d})`))}.</li>}
              <li>{improving.length > 0 ? <>Area yang membaik: {listJoin(improving.map((m) => `${m.area.name} (${m.d})`))}.</> : "Belum ada area yang membaik secara berarti."}</li>
              <li>{alertTeams.length ? `${alertTeams.length} divisi perlu perhatian: ${listJoin(alertTeams)}.` : "Tidak ada divisi dengan peringatan."}</li>
              <li>Fokus bulan depan: {areaAlerts[0]?.area ? `${areaById(areaAlerts[0].area).name} di ${m.teamById(areaAlerts[0].team)?.name}` : "pertahankan tren"}.</li>
            </ul>
          </Card>
          <Card title="Wellbeing 12 minggu">
            <LineChart series={[{ name: "Indeks wellbeing", color: "#0A66F5", values: series }]} labels={m.WEEKS.map((x) => x.label)} {...fitRange(series)} height={170} />
          </Card>
          <Card title="Kontak psikolog per bulan" sub="Jumlah karyawan yang menghubungi mitra, tanpa identitas">
            <MiniBars values={m.REFERRALS.byMonth} labels={m.REFERRALS.months} />
          </Card>
        </div>
        <Fine>Semua angka adalah agregat kelompok minimal {m.MIN_GROUP} orang. Skor area adalah sinyal skrining, bukan diagnosis.{!m.live && " Perusahaan dan angka di demo ini adalah contoh."}</Fine>
      </div>
    </>
  );
}
