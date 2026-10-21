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
import { AREA_COUNT, AREAS, areaById, areaStatus, groupOf, ROTATION } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";

const crumbs = [{ label: `${AREA_COUNT} Area`, href: ROUTES.hr.areas }];

/** Pearson correlation over the weeks both series have a value; null below 4 shared weeks. */
function correlation(a: (number | null)[], b: (number | null)[]) {
  const pairs = a.map((x, i) => [x, b[i]] as const).filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
  if (pairs.length < 4) return null;
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(pairs.map((p) => p[0])), mb = mean(pairs.map((p) => p[1]));
  let num = 0, da = 0, db = 0;
  for (const [x, y] of pairs) { num += (x - ma) * (y - mb); da += (x - ma) ** 2; db += (y - mb) ** 2; }
  return num / Math.sqrt(da * db || 1);
}

export function AreaDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { m, scope } = useHr();
  const area = areaById(id);
  if (!area) return <PageHeader title="Area tidak ditemukan" crumbs={crumbs} />;

  const g = groupOf(area.group);
  const v = m.areaValue(scope, id), d2 = m.areaDelta(scope, id, 2), d4 = m.areaDelta(scope, id, 4);
  const sev = m.severity(scope, id);
  const series = m.areaSeries(scope, id);
  const related = AREAS.filter((x) => x.id !== id).map((x) => ({ x, r: correlation(series, m.areaSeries(scope, x.id)) }))
    .filter((p): p is { x: (typeof AREAS)[number]; r: number } => p.r !== null).sort((p, q) => q.r - p.r).slice(0, 3);
  const company = m.areaValue("all", id) ?? undefined;
  const teams = m.TEAMS.filter((t) => !m.isHidden(t.id)).flatMap((t) => {
    const tv = m.areaValue(t.id, id);
    return tv === null ? [] : [{ id: t.id, label: t.name, color: g.color, v: tv, ref: company }];
  }).sort((p, q) => q.v - p.v);
  const hiddenTeams = m.TEAMS.filter((t) => m.isHidden(t.id));
  const worst = teams[0];
  const scopeName = scope === "all" ? "seluruh perusahaan" : m.teamById(scope)?.name;

  return (
    <>
      <PageHeader title={area.name} crumbs={crumbs}
        sub={<><span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: g.color }}><Dot color={g.color} />{g.name}</span>
          {area.alias && <> · {area.alias}</>} · {scopeName} · {area.core ? "diukur setiap minggu" : `bergilir tiap ${ROTATION.length} minggu`}</>} />

      <KpiGrid>
        <Kpi label="Intensitas sekarang" value={v ?? "-"} delta={d2 ?? undefined} foot={v === null ? "belum terukur" : <StatusChip s={areaStatus(v)} small />} />
        <Kpi label="Dibanding 4 minggu lalu" value={d4 === null ? "-" : d4 > 0 ? `+${d4}` : d4} foot="poin" />
        <Kpi label="Level tinggi" value={sev ? sev.tinggi : "-"} unit={sev ? "%" : undefined} foot="dari penjawab" />
        <Kpi label="Divisi tertinggi" value={worst?.v ?? "-"} foot={worst?.label} />
      </KpiGrid>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <div className="grid min-w-0 gap-[18px]">
          <Card title="Apa yang diukur">
            <p className="text-[15px]">{area.desc}</p>
            <Fine>Skor adalah sinyal skrining dari check-in, bukan diagnosis. Diagnosis hanya dapat diberikan oleh psikolog atau psikiater.</Fine>
          </Card>
          <Card title="Sebaran penjawab" sub="Persentase penjawab di tiap level, dari check-in terakhir yang menanyakan area ini">
            {sev ? <SeverityBar {...sev} /> : <HiddenNote text={`Tampil setelah area ini ditanyakan dan dijawab minimal ${m.MIN_GROUP} orang`} />}
          </Card>
          <Card title="Tren 12 minggu">
            <LineChart series={[{ name: area.name, color: g.color, values: series }]} labels={m.WEEKS.map((w) => w.label)} min={0} max={100} height={190} band={{ from: 62, to: 100 }} />
            <Fine>Pita abu-abu = zona perlu perhatian (62 ke atas).</Fine>
          </Card>
        </div>
        <div className="grid min-w-0 gap-[18px]">
          <Card title="Per divisi" sub="Garis kecil = rata-rata perusahaan. Klik divisi untuk detail.">
            {teams.length > 0 ? <CompareBars items={teams} onSelect={(tid) => router.push(ROUTES.hr.division(tid))} /> : <p className="text-muted">Belum ada divisi dengan skor untuk area ini.</p>}
            {hiddenTeams.length > 0 && <HiddenNote text={`${hiddenTeams.map((t) => t.name).join(", ")}: disembunyikan, kurang dari ${m.MIN_GROUP} orang`} />}
          </Card>
          <Card title="Sering bergerak bersama" sub="Area dengan pola tren paling mirip (12 minggu)">
            {related.length === 0 ? <p className="text-muted">Butuh minimal 4 minggu data bersama untuk membandingkan pola.</p> : (
              <ul className="grid gap-1">
                {related.map(({ x }) => {
                  const xd = m.areaDelta(scope, x.id);
                  return (
                    <li key={x.id} className="grid grid-cols-[1fr_auto_48px] items-center gap-2.5 border-t border-line py-[7px] first:border-t-0">
                      <Link href={ROUTES.hr.area(x.id)} className="inline-flex items-center gap-2 font-semibold hover:text-brand"><Dot color={groupOf(x.group).color} />{x.name}</Link>
                      <span className="num text-muted">{m.areaValue(scope, x.id) ?? "-"}</span>
                      <span className="text-right">{xd !== null && <Delta d={xd} />}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
