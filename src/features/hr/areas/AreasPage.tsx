"use client";
import Link from "next/link";
import { Dot, StatusChip, Tag } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sparkline } from "@/components/charts/Sparkline";
import { AREA_COUNT, AREAS, areaSeries, areaStatus, areaValue, GROUPS, NOW, teamById } from "@/lib/data";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";

export function AreasPage() {
  const { scope } = useHr();
  return (
    <>
      <PageHeader title={`${AREA_COUNT} Area`} sub={`${scope === "all" ? "Seluruh perusahaan" : teamById(scope).name} · intensitas 0 sampai 100, makin tinggi makin perlu perhatian`} />
      {GROUPS.map((g) => (
        <section key={g.id} className="grid gap-2.5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold" style={{ color: g.color }}><Dot color={g.color} className="size-2.5" />{g.name}</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3">
            {AREAS.filter((a) => a.group === g.id).map((a) => {
              const v = areaValue(scope, a.id), d = v - areaValue(scope, a.id, NOW - 2);
              return (
                <Link key={a.id} href={ROUTES.hr.area(a.id)} style={{ borderTopColor: g.color }}
                  className="grid justify-items-start gap-1.5 rounded-[14px] border border-t-[3px] border-line bg-white p-3 text-left transition-shadow hover:shadow-lg sm:p-3.5">
                  <span className="flex w-full items-start justify-between gap-1.5">
                    <span className="grid min-h-[38px] content-start gap-0.5"><b>{a.name}</b>{a.alias && <small className="text-xs text-muted">{a.alias}</small>}</span>
                    {a.core && <Tag className="hidden sm:inline-block">mingguan</Tag>}
                  </span>
                  <span className="flex items-baseline gap-2"><b className="num text-[26px] font-bold text-head">{v}</b><Delta d={d} /></span>
                  <Sparkline values={areaSeries(scope, a.id)} color={g.color} w={150} h={32} className="block h-auto max-w-full" />
                  <StatusChip s={areaStatus(v)} small />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
