"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Fine } from "@/components/ui/Card";
import { Dot, StatusChip, Tag } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/cn";
import { areaById, groupOf, type Status } from "@/lib/catalog";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";

type SortKey = "status" | "name" | "wb" | "part";
const STATUS_RANK: Record<Status, number> = { perhatian: 0, waspada: 1, baik: 2 };

export function DivisionsPage() {
  const router = useRouter();
  const { m } = useHr();
  const [sort, setSort] = useState<SortKey>("status");
  const { NOW, TEAMS } = m;
  const rows = TEAMS.map((t) => {
    const wb = m.wellbeing(t.id) ?? 0, prev = m.wellbeing(t.id, NOW - 2);
    return {
      t, hidden: m.isHidden(t.id), st: m.teamStatus(t.id), wb, wbD: prev === null ? null : wb - prev,
      part: m.part(t.id), focus: m.isHidden(t.id) ? undefined : m.focusAreas(t.id)[0],
    };
  }).sort((a, b) => {
    if (a.hidden !== b.hidden) return a.hidden ? 1 : -1;
    if (sort === "name") return a.t.name.localeCompare(b.t.name);
    if (sort === "wb") return a.wb - b.wb;
    if (sort === "part") return a.part - b.part;
    return STATUS_RANK[a.st] - STATUS_RANK[b.st] || a.wb - b.wb;
  });

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="px-4 py-3">
      <button type="button" onClick={() => setSort(k)} className={cn("inline-flex items-center gap-1 font-semibold", sort === k ? "text-ink" : "text-muted")}>
        {label}{sort === k && <Icon name="down" size={12} />}
      </button>
    </th>
  );

  return (
    <>
      <PageHeader title="Divisi" sub={`${TEAMS.length} divisi · diurutkan dari yang paling perlu perhatian`} />
      <div className="overflow-hidden rounded-card border border-line bg-white">
        <table className="w-full table-fixed border-collapse md:table-auto">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line bg-[#fafbfc] text-left text-[14px] whitespace-nowrap text-muted">
              <SortTh k="name" label="Divisi" /><SortTh k="status" label="Status" /><SortTh k="wb" label="Wellbeing" />
              <th className="px-4 py-3 font-semibold">12 minggu</th><SortTh k="part" label="Partisipasi" />
              <th className="px-4 py-3 font-semibold">Fokus utama</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t.id} onClick={() => router.push(ROUTES.hr.division(r.t.id))}
                className="grid cursor-pointer grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-[#f7f8fb] md:table-row md:p-0 [&>td]:md:px-4 [&>td]:md:py-3">
                <td className="col-span-2">
                  <Link href={ROUTES.hr.division(r.t.id)} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline">{r.t.name}</Link>
                  <small className="block text-muted">{r.t.size} orang · {m.respondents(r.t.id)} menjawab</small>
                </td>
                {r.hidden ? <td colSpan={5} className="col-span-2"><HiddenNote text={`Disembunyikan, kurang dari ${m.MIN_GROUP} orang`} /></td> : (
                  <>
                    <td><StatusChip s={r.st} small /></td>
                    <td><b className="num">{r.wb}</b> {r.wbD !== null && <Delta d={r.wbD} goodWhenUp />}</td>
                    <td><Sparkline values={m.wellbeingSeries(r.t.id)} color={r.st === "perhatian" ? "#B03424" : "#0A66F5"} /></td>
                    <td><b className="num">{r.part}%</b>{r.part < 60 && <Tag tone="warn" className="ml-1.5">data terbatas</Tag>}</td>
                    <td className="col-span-2">{r.focus
                      ? <span className="inline-flex items-center gap-1.5"><Dot color={groupOf(areaById(r.focus.area).group).color} />{areaById(r.focus.area).name} <span className="num text-muted">{r.focus.v}</span></span>
                      : <span className="text-muted">Semua area baik</span>}</td>
                  </>
                )}
                <td className="hidden w-9 text-muted md:table-cell"><Icon name="arrow" size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {TEAMS.length === 0 && <p className="text-muted">Belum ada divisi. Tambahkan di Pengaturan.</p>}
      <Fine>Divisi dengan kurang dari {m.MIN_GROUP} penjawab tetap tercantum, tetapi skornya disembunyikan untuk melindungi identitas.</Fine>
    </>
  );
}
