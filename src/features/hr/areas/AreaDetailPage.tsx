"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Fine } from "@/components/ui/Card";
import { Dot, StatusChip } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompareBars } from "@/components/charts/CompareBars";
import { LineChart } from "@/components/charts/LineChart";
import { SeverityBar } from "@/components/charts/SeverityBar";
import { AREAS, areaById, areaSeries, areaStatus, areaValue, groupOf, isHidden, NOW, severity, teamById, TEAMS, VAL, WEEKS } from "@/lib/data";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";

const crumbs = [{ label: "17 Area", href: ROUTES.hr.areas }];

/** Pearson correlation of two equally long series. */
function correlation(a: number[], b: number[]) {
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  a.forEach((x, i) => { num += (x - ma) * (b[i] - mb); da += (x - ma) ** 2; db += (b[i] - mb) ** 2; });
  return num / Math.sqrt(da * db || 1);
}

export function AreaDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { scope } = useHr();
  const area = areaById(id);
  if (!area) return <PageHeader title="Area tidak ditemukan" crumbs={crumbs} />;

  const g = groupOf(area.group);
  const v = areaValue(scope, id), d2 = v - areaValue(scope, id, NOW - 2), d4 = v - areaValue(scope, id, NOW - 4);
  const sev = severity(v);
  const series = areaSeries(scope, id);
  const related = AREAS.filter((x) => x.id !== id).map((x) => ({ x, r: correlation(series, areaSeries(scope, x.id)) })).sort((p, q) => q.r - p.r).slice(0, 3);
  const teams = TEAMS.filter((t) => !isHidden(t.id)).map((t) => ({ id: t.id, label: t.name, color: g.color, v: VAL[t.id][id][NOW], ref: areaValue("all", id) })).sort((p, q) => q.v - p.v);
  const hiddenTeams = TEAMS.filter((t) => isHidden(t.id));
  const worst = teams[0];

  return (
    <>
      <PageHeader title={area.name} crumbs={crumbs}
        sub={<><span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: g.color }}><Dot color={g.color} />{g.name}</span>
          {area.alias && <> · {area.alias}</>} · {scope === "all" ? "seluruh perusahaan" : teamById(scope).name} · {area.core ? "diukur setiap minggu" : "bergilir tiap 5 minggu"}</>} />

      <KpiGrid>
        <Kpi label="Intensitas sekarang" value={v} delta={d2} foot={<StatusChip s={areaStatus(v)} small />} />
        <Kpi label="Dibanding 4 minggu lalu" value={d4 > 0 ? `+${d4}` : d4} foot="poin" />
        <Kpi label="Level tinggi" value={sev.tinggi} unit="%" foot="dari penjawab" />
        <Kpi label="Divisi tertinggi" value={worst?.v ?? "-"} foot={worst?.label} />
      </KpiGrid>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <div className="grid min-w-0 gap-[18px]">
          <Card title="Apa yang diukur">
            <p className="text-[15px]">{area.desc}</p>
            <Fine>Skor adalah sinyal skrining dari check-in, bukan diagnosis. Diagnosis hanya dapat diberikan oleh psikolog atau psikiater.</Fine>
          </Card>
          <Card title="Sebaran penjawab" sub="Persentase penjawab di tiap level minggu ini"><SeverityBar {...sev} /></Card>
          <Card title="Tren 12 minggu">
            <LineChart series={[{ name: area.name, color: g.color, values: series }]} labels={WEEKS.map((w) => w.label)} min={0} max={100} height={190} band={{ from: 62, to: 100 }} />
            <Fine>Pita abu-abu = zona perlu perhatian (62 ke atas).</Fine>
          </Card>
        </div>
        <div className="grid min-w-0 gap-[18px]">
          <Card title="Per divisi" sub="Garis kecil = rata-rata perusahaan. Klik divisi untuk detail.">
            <CompareBars items={teams} onSelect={(tid) => router.push(ROUTES.hr.division(tid))} />
            {hiddenTeams.length > 0 && <HiddenNote text={`${hiddenTeams.map((t) => t.name).join(", ")}: disembunyikan, kurang dari 5 orang`} />}
          </Card>
          <Card title="Sering bergerak bersama" sub="Area dengan pola tren paling mirip (12 minggu)">
            <ul className="grid gap-1">
              {related.map(({ x }) => (
                <li key={x.id} className="grid grid-cols-[1fr_auto_48px] items-center gap-2.5 border-t border-line py-[7px] first:border-t-0">
                  <Link href={ROUTES.hr.area(x.id)} className="inline-flex items-center gap-2 font-semibold hover:text-brand"><Dot color={groupOf(x.group).color} />{x.name}</Link>
                  <span className="num text-muted">{areaValue(scope, x.id)}</span>
                  <span className="text-right"><Delta d={areaValue(scope, x.id) - areaValue(scope, x.id, NOW - 2)} /></span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
