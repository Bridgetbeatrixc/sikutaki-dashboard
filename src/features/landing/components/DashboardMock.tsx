"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { TOP_AREAS } from "../content";
import { Heatmap } from "./Heatmap";
import { Ring } from "./Ring";
import { TrendChart, TrendLegend } from "./TrendChart";
import { BarRow } from "./ui";

type View = "ringkasan" | "peta" | "tren";
const VIEWS: { id: View; icon: IconName; label: string }[] = [
  { id: "ringkasan", icon: "grid", label: "Ringkasan" },
  { id: "peta", icon: "map", label: "Peta 42 Area" },
  { id: "tren", icon: "trend", label: "Tren" },
];

const panel = "grid min-w-0 content-start gap-2.5 rounded-[14px] border border-line px-4 py-3.5";
const panelHead = "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5";
const tip = "flex items-start gap-2 rounded-[10px] bg-[#fdf3ea] px-[11px] py-[9px] text-xs text-[#7a4a1c] [&>svg]:mt-px [&>svg]:shrink-0";
/** Labels show on phones (horizontal tabs) and on desktop, but not on the tablet icon rail. */
const railLabel = "sm:hidden lg:inline";

/** A browser-framed preview of the HR dashboard with three switchable views. */
export function DashboardMock() {
  const [view, setView] = useState<View>("ringkasan");
  return (
    <div className="mx-auto max-w-[1080px] overflow-hidden rounded-[18px] bg-white text-left text-[13px] shadow-[0_30px_70px_rgba(0,0,0,.16),0_0_0_1px_rgba(0,0,0,.05)]">
      <div className="flex items-center gap-3.5 border-b border-line bg-[#f5f6f8] px-3.5 py-2.5">
        <span className="flex gap-1.5">{["#f2a49a", "#f3d27a", "#9fb8d8"].map((c) => <i key={c} className="size-2.5 rounded-full" style={{ background: c }} />)}</span>
        <span className="min-w-0 flex-1 truncate rounded-lg border border-line bg-white px-2.5 py-1 font-mono text-[11.5px] text-muted">app.sikutaki.com/dashboard-hr</span>
        <span className="rounded-full bg-[#fdf0e2] px-2 py-[3px] font-mono text-[10.5px] whitespace-nowrap text-[#9a6b2f]">Data contoh</span>
      </div>

      <div className="flex flex-col sm:min-h-[470px] sm:flex-row">
        <aside className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-[#f8f9fb] p-2 sm:w-16 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:px-2 sm:py-3.5 lg:w-[200px] lg:px-3 lg:py-[18px]">
          <span className="hidden items-center justify-center gap-2 pb-3 text-[15px] font-semibold text-head sm:flex lg:justify-start lg:px-2 lg:pb-3.5">
            <img src={asset("/logo.png")} alt="" width={26} height={26} /><span className="hidden lg:inline">Sikutaki</span>
          </span>
          {VIEWS.map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)} aria-pressed={view === v.id}
              className={cn("flex shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-left text-[13.5px] font-medium sm:justify-center lg:justify-start",
                view === v.id ? "bg-mint font-semibold text-brand" : "text-muted hover:bg-[#eef0f5] hover:text-ink")}>
              <Icon name={v.icon} size={17} /><span className={railLabel}>{v.label}</span>
            </button>
          ))}
          {([["book", "Program"], ["cog", "Pengaturan"]] as [IconName, string][]).map(([icon, label]) => (
            <span key={label} className="hidden items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13.5px] font-medium text-muted opacity-65 sm:flex sm:justify-center lg:justify-start">
              <Icon name={icon} size={17} /><span className="hidden lg:inline">{label}</span>
            </span>
          ))}
          <span className="mt-auto hidden items-center gap-1.5 px-2 pt-2.5 text-[11.5px] text-muted lg:flex"><Icon name="lock" size={14} /> Anonim, min. 5 orang</span>
        </aside>

        <div className="grid min-w-0 flex-1 content-start gap-4 bg-white px-[22px] pt-5 pb-[22px]">
          <div className="flex items-center justify-between gap-3">
            <div><small className="block text-[11.5px] text-muted">PT Contoh Nusantara</small><b className="text-[17px] font-semibold text-ink">Kondisi tim minggu ini</b></div>
            <span className="rounded-full bg-[#f1f3f6] px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-muted">Minggu ke-12</span>
          </div>
          {view === "ringkasan" && <Summary />}
          {view === "peta" && (
            <div className={panel}>
              <div className={panelHead}><b className="text-[13.5px] font-semibold">Peta area per tim</b><small className="text-[11.5px] text-muted">skor rata-rata, 0 sampai 100</small></div>
              <Heatmap />
            </div>
          )}
          {view === "tren" && (
            <div className={panel}>
              <div className={panelHead}><b className="text-[13.5px] font-semibold">Tren area utama</b><TrendLegend /></div>
              <TrendChart w={760} h={260} />
              <div className={tip}><Icon name="trend" size={16} /> Tingkat stres turun 17 poin sejak program jam kerja fleksibel dimulai di minggu ke-5.</div>
            </div>
          )}
          <Link href={ROUTES.demo.hr} className="inline-flex items-center gap-1.5 justify-self-start font-semibold text-brand">
            Buka dashboard lengkap <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({ figure, title, sub, subClass }: { figure: React.ReactNode; title: string; sub: string; subClass?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-[14px] border border-line px-3 py-2.5">
      {figure}
      <div><b className="block text-[12.5px] font-semibold">{title}</b><small className={cn("block text-[11.5px] text-muted", subClass)}>{sub}</small></div>
    </div>
  );
}

const kpiNumber = "num text-[22px] font-semibold tracking-tight text-head sm:text-[26px]";

function Summary() {
  return (
    <div className="grid gap-3.5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi figure={<Ring value={84} size={56} label="84%" />} title="Partisipasi" sub="412 dari 490" />
        <Kpi figure={<span className={kpiNumber}>68<em className="text-[13px] font-medium text-muted not-italic">/100</em></span>} title="Indeks wellbeing" sub="naik 4 poin" subClass="text-brand-2" />
        <Kpi figure={<span className={cn(kpiNumber, "text-[#d0573f]")}>2</span>} title="Tim perlu perhatian" sub="Penjualan, Layanan" />
        <Kpi figure={<span className={kpiNumber}>7</span>} title="Rujukan psikolog" sub="bulan ini" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-[1.5fr_1fr]">
        <div className={panel}>
          <div className={panelHead}><b className="text-[13.5px] font-semibold">Tren 12 minggu</b><TrendLegend /></div>
          <TrendChart w={520} h={190} />
        </div>
        <div className={panel}>
          <div className={panelHead}><b className="text-[13.5px] font-semibold">Area tertinggi minggu ini</b></div>
          {TOP_AREAS.map(([name, v, color]) => <BarRow key={name} label={name} value={v} color={color} />)}
          <div className={tip}><Icon name="bell" size={16} /> Burnout di tim Layanan naik 3 minggu berturut-turut.</div>
        </div>
      </div>
    </div>
  );
}
