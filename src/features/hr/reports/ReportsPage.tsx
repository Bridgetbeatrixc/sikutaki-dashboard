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
import { alerts, areaById, COMPANY, movers, NOW, participation, REFERRALS, teamById, wellbeing, wellbeingSeries, WEEKS } from "@/lib/data";
import { NOTE_LABEL } from "@/lib/focus";
import { listJoin } from "@/lib/format";
import { asset } from "@/lib/paths";
import { useHr } from "../HrProvider";

const MONTHS = ["Oktober 2026", "September 2026", "Agustus 2026"];

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
  const { toast, notes } = useHr();
  const [month, setMonth] = useState(MONTHS[0]);
  const wb = wellbeing("all"), wb4 = wellbeing("all", NOW - 4);
  const mv = movers("all");
  const rising = mv.filter((m) => m.d > 0).slice(0, 2);
  const improving = mv.filter((m) => m.d < 0).slice(-2).reverse();
  const areaAlerts = alerts().filter((a) => a.kind !== "partisipasi");
  const alertTeams = [...new Set(areaAlerts.map((a) => teamById(a.team).name))];
  const series = wellbeingSeries("all");

  return (
    <>
      <PageHeader title="Laporan" sub="Ringkasan bulanan untuk direksi, dibuat otomatis dari data agregat"
        action={
          <div className="flex flex-wrap gap-2.5">
            <select aria-label="Bulan laporan" className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <Button onClick={() => toast("Prototipe: ekspor PDF aktif di versi produksi")}><Icon name="download" size={16} />Ekspor PDF</Button>
          </div>
        } />
      <div className="grid gap-5 rounded-[20px] border border-line bg-white p-4 shadow-lg shadow-ink/5 sm:p-7">
        <div className="flex items-center justify-between border-b-2 border-brand pb-3.5">
          <div><small className="text-muted">Laporan kesehatan mental karyawan</small><h2 className="text-[22px] font-bold">{COMPANY.name} · {month}</h2></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logo.svg")} alt="" width={36} height={36} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          <ReportKpi label="Indeks wellbeing" value={wb} foot={`${wb >= wb4 ? "+" : ""}${wb - wb4} vs bulan lalu`} tone={wb >= wb4 ? "good" : "bad"} />
          <ReportKpi label="Partisipasi rata-rata" value={`${participation("all")}%`} foot={`${COMPANY.employees} karyawan`} />
          <ReportKpi label="Langkah HR dilakukan" value={notes.filter((n) => n.type === "dilakukan").length} foot={`${NOTE_LABEL.dilakukan}, dari catatan HR`} />
          <ReportKpi label="Rujukan psikolog" value={REFERRALS.thisMonth} foot="total anonim" />
        </div>
        <div className="grid gap-3.5 xl:grid-cols-[1.2fr_1fr_0.7fr]">
          <Card title="Ringkasan">
            <ul className="grid list-disc gap-1.5 pl-[18px]">
              <li>Wellbeing perusahaan {wb >= wb4 ? "naik" : "turun"} {Math.abs(wb - wb4)} poin dalam 4 minggu terakhir.</li>
              {rising.length > 0 && <li>Area yang paling naik: {listJoin(rising.map((m) => `${m.area.name} (+${m.d})`))}.</li>}
              <li>{improving.length > 0 ? <>Area yang membaik: {listJoin(improving.map((m) => `${m.area.name} (${m.d})`))}.</> : "Belum ada area yang membaik secara berarti."}</li>
              <li>{alertTeams.length} divisi perlu perhatian: {listJoin(alertTeams)}.</li>
              <li>Fokus bulan depan: {areaAlerts[0]?.area ? `${areaById(areaAlerts[0].area).name} di ${teamById(areaAlerts[0].team).name}` : "pertahankan tren"}.</li>
            </ul>
          </Card>
          <Card title="Wellbeing 12 minggu">
            <LineChart series={[{ name: "Indeks wellbeing", color: "#0B6B4F", values: series }]} labels={WEEKS.map((w) => w.label)} {...fitRange(series)} height={170} />
          </Card>
          <Card title="Rujukan psikolog per bulan" sub="Jumlah saja, tanpa identitas">
            <MiniBars values={REFERRALS.byMonth} labels={REFERRALS.months} />
          </Card>
        </div>
        <Fine>Semua angka adalah agregat kelompok minimal 5 orang. Data contoh untuk prototipe.</Fine>
      </div>
    </>
  );
}
