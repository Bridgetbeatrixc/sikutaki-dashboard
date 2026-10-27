"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Dot, StatusChip, Tag } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { inputClass } from "@/components/ui/form";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { fitRange, LineChart } from "@/components/charts/LineChart";
import { CountUp, GrowBar, Reveal, ScoreRing } from "@/components/motion";
import { guideOf } from "@/lib/area-guide";
import {
  AREA_COUNT, AREAS, areaById, areaStatus, CAUSES, changeMeaning, groupOf, GROUPS, NOTE_LABEL, OTHER_CAUSE, SCORE_BASIS, scoreMeaning,
  STATUS_LABEL, WELLBEING_BANDS, wellbeingBand, type Status,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { listJoin } from "@/lib/format";
import type { Model } from "@/lib/model";
import { asset, ROUTES } from "@/lib/paths";
import { practiceById, programById } from "@/lib/practice";
import { monthLabel, MONTHS, shortDate } from "@/lib/week";
import { useHr } from "../HrProvider";
import { NOTE_TONE } from "../noteTone";

const STATUS_COLOR: Record<Status, string> = { baik: "#1f9d68", waspada: "#e0a020", perhatian: "#d4583f" };

type Period = { label: string; weeks: number[]; w: number; prev: { label: string; w: number } | null };

/**
 * Monthly report for HR and the board, from aggregate data only, in four parts: executive summary, map of the
 * 42 areas, analysis and action plan, evaluation and follow-up. Charts stop at the reported month; earlier
 * weeks are shown as a labelled comparison.
 */
export function ReportsPage() {
  const { m } = useHr();
  const months: Period[] = [];
  m.WEEKS.forEach((wk, w) => {
    if (w > m.NOW || m.wellbeing("all", w) === null) return;
    const label = monthLabel(wk.start), found = months.find((x) => x.label === label);
    if (found) { found.w = w; found.weeks.push(w); } else months.push({ label, w, weeks: [w], prev: null });
  });
  months.forEach((x, i) => { x.prev = i > 0 ? { label: months[i - 1].label, w: months[i - 1].w } : null; });
  months.reverse();
  const [pick, setPick] = useState(months[0]?.label ?? "");
  const p = months.find((x) => x.label === pick) ?? months[0];
  if (!p) return null;
  const first = m.WEEKS[p.weeks[0]].start, last = m.WEEKS[p.w].start;

  return (
    <>
      <div className="print:hidden"><PageHeader title="Laporan" sub="Laporan bulanan untuk HR dan direksi, dibuat otomatis dari data agregat"
        action={
          <div className="flex flex-wrap gap-2.5">
            <select aria-label="Bulan laporan" className={inputClass} value={p.label} onChange={(e) => setPick(e.target.value)}>
              {months.map((x) => <option key={x.label}>{x.label}</option>)}
            </select>
            <Button onClick={() => window.print()}><Icon name="download" size={16} />Simpan sebagai PDF</Button>
          </div>
        } /></div>
      <div className="grid gap-6 rounded-[20px] border border-line bg-white p-4 shadow-lg shadow-ink/5 sm:p-7 print:block print:space-y-6 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between gap-3 border-b-2 border-brand pb-3.5">
          <div>
            <small className="text-muted">Laporan kesehatan mental karyawan</small>
            <h2 className="text-[24px] font-bold">{m.COMPANY.name} · {p.label}</h2>
            <p className="mt-1 text-[15px] text-muted">
              Periode laporan: check-in {shortDate(first)} sampai {shortDate(last)} ({p.weeks.length} minggu).
              {p.prev ? ` Pembanding: ${p.prev.label} (check-in terakhir ${shortDate(m.WEEKS[p.prev.w].start)}).` : " Belum ada bulan pembanding."}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logo.png")} alt="" width={36} height={36} />
        </div>
        <nav className="flex flex-wrap gap-1.5 print:hidden" aria-label="Isi laporan">
          {PARTS.map((x, i) => <a key={x.id} href={`#${x.id}`} className="rounded-full bg-canvas px-3 py-1.5 text-[14.5px] font-semibold text-body hover:bg-mint hover:text-brand">{i + 1}. {x.title}</a>)}
        </nav>
        <Executive m={m} p={p} />
        <AreaMap m={m} p={p} />
        <Analysis m={m} p={p} />
        <Evaluation m={m} p={p} />
        <Basis m={m} />
      </div>
    </>
  );
}

const PARTS = [
  { id: "ringkasan", title: "Ringkasan eksekutif" },
  { id: "peta", title: `Peta ${AREA_COUNT} area` },
  { id: "analisis", title: "Analisis dan rencana tindakan" },
  { id: "evaluasi", title: "Evaluasi dan tindak lanjut" },
];

function Part({ id, sub, children }: { id: string; sub?: string; children: ReactNode }) {
  const i = PARTS.findIndex((x) => x.id === id);
  return (
    <Reveal as="section" className="grid gap-3.5 print:block print:space-y-3.5">
      <header id={id} className="scroll-mt-24 border-b border-line pb-2">
        <h2 className="text-[20px] font-bold"><span className="text-brand">{i + 1}.</span> {PARTS[i].title}</h2>
        {sub && <p className="mt-0.5 text-[15px] text-muted">{sub}</p>}
      </header>
      {children}
    </Reveal>
  );
}

/** "Belum cukup data" with what to do about it; never a zero. */
function NotEnough({ children, href, cta }: { children: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="grid gap-1.5 rounded-[12px] border border-dashed border-[#c9d6ea] bg-[#f8fafd] px-3 py-2.5 text-[15px] text-body">
      <span><b className="text-ink">Belum cukup data.</b> {children}</span>
      {href && cta && <Link href={href} className="w-fit font-semibold text-brand print:hidden">{cta} →</Link>}
    </div>
  );
}

/* ---------- 1. Executive summary ---------- */

type Finding = { kind: "data"; text: ReactNode };

function topActions(m: Model, w: number) {
  return m.alerts(w).filter((a) => a.area).slice(0, 4).map((a) => {
    const team = m.teamById(a.team)!;
    const shares = m.causeShares(a.team, a.area!, w);
    const top = shares.rows.filter((r) => r.cause.id !== OTHER_CAUSE).slice(0, 2);
    const other = shares.rows.find((r) => r.cause.id === OTHER_CAUSE);
    return { a, team, area: areaById(a.area!), shares, top, other };
  });
}

function Executive({ m, p }: { m: Model; p: Period }) {
  const w = p.w;
  const wb = m.wellbeing("all", w);
  const prev = p.prev ? m.wellbeing("all", p.prev.w) : null;
  const band = wb === null ? null : wellbeingBand(wb);
  const change = wb !== null && prev !== null ? changeMeaning(wb - prev, m.respondents("all", w)) : null;
  const resp = m.respondents("all", w), part = m.participation("all", w);
  const actions = topActions(m, w);
  const movers = m.movers("all", w);
  const top = m.scoredAreas("all", w).sort((x, y) => y.v - x.v)[0];
  const lowPart = m.TEAMS.filter((t) => !m.isHidden(t.id, w) && m.part(t.id, w) < 60);

  const findings: Finding[] = [];
  if (actions[0]) findings.push({ kind: "data", text: <><b>{actions[0].area.name}</b> di {actions[0].team.name} {actions[0].a.kind === "naik" ? `naik ${actions[0].a.delta} poin dalam 2 minggu` : "berada di zona perlu perhatian"} (skor {actions[0].a.value}, {scoreMeaning(actions[0].a.value)}).</> });
  if (top) findings.push({ kind: "data", text: <>Area tertinggi di perusahaan: <b>{top.area.name}</b>, skor {top.v} ({scoreMeaning(top.v)}).</> });
  const better = movers.filter((x) => x.d <= -5).slice(-1)[0];
  if (lowPart.length) findings.push({ kind: "data", text: <>Partisipasi di bawah 60% di <b>{listJoin(lowPart.map((t) => t.name))}</b>, jadi skor divisi tersebut kurang mewakili.</> });
  else if (better) findings.push({ kind: "data", text: <><b>{better.area.name}</b> membaik {Math.abs(better.d)} poin dalam 4 minggu.</> });

  const series = m.wellbeingSeries("all").slice(0, w + 1);
  const labels = m.WEEKS.slice(0, w + 1).map((x) => x.label);
  const contacts = referralFor(m, p);

  return (
    <Part id="ringkasan" sub="Kondisi umum, perubahan dari bulan sebelumnya, tiga temuan utama, dan tiga prioritas tindakan">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid justify-items-center gap-2 rounded-[16px] bg-canvas px-5 py-4">
          <ScoreRing value={wb} color={band ? STATUS_COLOR[band.status] : "#c3c8d0"} label="indeks wellbeing" />
          {band ? <><StatusChip s={band.status} small /><b className="text-[15.5px]">{band.label}</b><small className="max-w-[210px] text-center text-[14.5px] leading-snug text-muted">{band.text}</small></>
            : <NotEnough href={ROUTES.hr.checkin} cta="Atur check-in">Indeks muncul setelah minimal {m.MIN_GROUP} orang mengisi check-in.</NotEnough>}
        </div>
        <div className="grid content-start gap-3">
          <BandScale value={wb} />
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <Stat label="Responden" value={resp} foot={`dari ${m.sizeScope("all")} karyawan, minggu ${m.WEEKS[w].label}`} />
            <Stat label="Partisipasi" value={part} unit="%" foot={part >= 60 ? "cukup mewakili (60% ke atas)" : "di bawah 60%, kurang mewakili"} tone={part >= 60 ? undefined : "bad"} />
            <Stat label={`Perubahan vs ${p.prev?.label.split(" ")[0] ?? "bulan lalu"}`} value={change ? (wb! - prev! > 0 ? `+${wb! - prev!}` : wb! - prev!) : "-"} unit={change ? " poin" : undefined}
              foot={change ? change.label : "belum ada pembanding"} tone={change?.level === "bermakna" ? (wb! > prev! ? "good" : "bad") : undefined} />
            <Stat label="Kontak psikolog" value={contacts.n ?? "-"} foot={contacts.n === null ? "belum cukup data" : `${contacts.rate} per 100 karyawan`} />
          </div>
          {change && <p className="rounded-[12px] bg-canvas px-3 py-2 text-[15px] text-body"><b>Arti perubahan:</b> {change.text}</p>}
        </div>
      </div>
      <div className="grid gap-3.5 xl:grid-cols-2">
        <Card title="Tiga temuan utama" sub="Temuan dari data, belum penjelasan penyebabnya">
          <ol className="grid gap-2">
            {findings.slice(0, 3).map((f, i) => (
              <li key={i} className="grid grid-cols-[24px_1fr] gap-2 text-[15.5px] leading-normal"><span className="grid size-6 place-items-center rounded-full bg-mint text-[14.5px] font-bold text-brand">{i + 1}</span><span>{f.text}</span></li>
            ))}
            {findings.length === 0 && <NotEnough>Belum ada temuan yang menonjol bulan ini.</NotEnough>}
          </ol>
        </Card>
        <Card title="Tiga prioritas tindakan" sub="Rincian, PIC, dan ukuran keberhasilan ada di bagian 3">
          <ol className="grid gap-2">
            {priorities(actions).map((x, i) => (
              <li key={x.a.id} className="grid grid-cols-[24px_1fr] gap-2 text-[15.5px] leading-normal">
                <span className="grid size-6 place-items-center rounded-full bg-[#fdf1dc] text-[14.5px] font-bold text-warn">{i + 1}</span>
                <span><b>{x.team.name}: {x.area.name}.</b> {x.idea}.</span>
              </li>
            ))}
            {actions.length === 0 && <li className="text-[15.5px] text-muted">Tidak ada divisi dengan peringatan. Pertahankan program yang berjalan.</li>}
          </ol>
        </Card>
      </div>
      <Card title="Indeks wellbeing per minggu" sub={`Area biru = ${p.label}. Minggu sebelumnya ditampilkan sebagai pembanding.`}>
        <LineChart series={[{ name: "Indeks wellbeing", color: "#0A66F5", values: series }]} labels={labels} {...fitRange(series)} height={190}
          xBand={{ from: p.weeks[0], to: p.w, label: p.label.split(" ")[0] }} />
      </Card>
    </Part>
  );
}

/** The first three actions, each with a different idea (the second cause when two divisions share the first). */
function priorities(actions: ReturnType<typeof topActions>) {
  const used = new Set<string>();
  return actions.slice(0, 3).map((x) => {
    const pick = x.top.find((r) => !used.has(`${x.team.id}:${r.cause.id}`) && !used.has(r.cause.id)) ?? x.top[0];
    if (pick) { used.add(pick.cause.id); used.add(`${x.team.id}:${pick.cause.id}`); }
    return { ...x, idea: pick ? CAUSES[pick.cause.id].idea : "Bahas dengan lead divisi untuk memahami konteksnya" };
  });
}

function Stat({ label, value, unit, foot, tone }: { label: string; value: ReactNode; unit?: string; foot: string; tone?: "good" | "bad" }) {
  return (
    <div className="grid min-w-0 content-start gap-0.5 rounded-[14px] bg-canvas p-3">
      <small className="text-[14px] text-muted">{label}</small>
      <b className="num text-[26px] leading-tight text-head">{typeof value === "number" ? <CountUp value={value} /> : value}{unit && <small className="text-[15.5px] font-medium text-muted">{unit}</small>}</b>
      <em className={cn("text-[14px] leading-snug not-italic", tone === "good" ? "font-semibold text-good" : tone === "bad" ? "font-semibold text-bad" : "text-muted")}>{foot}</em>
    </div>
  );
}

/** The five wellbeing bands on one bar, with a marker for the current value. */
function BandScale({ value }: { value: number | null }) {
  const bands = [...WELLBEING_BANDS].reverse();
  return (
    <div className="grid gap-1">
      <div className="relative flex h-3 overflow-hidden rounded-full">
        {bands.map((b, i) => {
          const to = bands[i + 1]?.min ?? 100;
          return <span key={b.label} style={{ width: `${to - b.min}%`, background: STATUS_COLOR[b.status], opacity: 0.35 + i * 0.13 }} title={`${b.label}: ${b.min}-${to === 100 ? 100 : to - 1}`} />;
        })}
        {value !== null && <span className="absolute top-[-3px] h-[18px] w-[3px] rounded bg-ink transition-[left] duration-700" style={{ left: `calc(${value}% - 1.5px)` }} />}
      </div>
      <div className="flex overflow-hidden text-[13px] text-muted">
        {bands.map((b, i) => <span key={b.label} style={{ width: `${(bands[i + 1]?.min ?? 100) - b.min}%` }} className="min-w-0 truncate">{b.label} {b.min}</span>)}
      </div>
    </div>
  );
}

function referralFor(m: Model, p: Period) {
  const month = MONTHS[Number(m.WEEKS[p.w].start.slice(5, 7)) - 1];
  const i = m.REFERRALS.months.indexOf(month);
  const n = i < 0 ? null : m.REFERRALS.byMonth[i];
  const prev = i > 0 ? m.REFERRALS.byMonth[i - 1] : null;
  const rate = n === null ? 0 : Math.round((n / Math.max(1, m.sizeScope("all"))) * 1000) / 10;
  return { n, prev, rate, i };
}

/* ---------- 2. Map of the 42 areas ---------- */

const heat = (v: number) => {
  const s = areaStatus(v);
  return s === "perhatian" ? `rgba(212,88,63,${0.25 + Math.min(1, (v - 62) / 30) * 0.55})` : s === "waspada" ? "rgba(224,160,32,.35)" : `rgba(31,157,104,${0.12 + Math.max(0, (52 - v) / 52) * 0.3})`;
};

function AreaMap({ m, p }: { m: Model; p: Period }) {
  const w = p.w;
  const teams = m.TEAMS;
  return (
    <Part id="peta" sub="Skor 0 sampai 100 = rata-rata seberapa sering dialami (makin tinggi makin perlu perhatian). Arah = perubahan dalam 4 minggu.">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14.5px] text-muted">
        <span className="flex items-center gap-1.5"><i className="size-3 rounded" style={{ background: heat(35) }} />Baik (di bawah 52)</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded" style={{ background: heat(56) }} />Waspada (52 sampai 61)</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded" style={{ background: heat(70) }} />Perlu perhatian (62 ke atas)</span>
        <span className="flex items-center gap-1.5"><i className="bg-hatch size-3 rounded" />Disembunyikan, kurang dari {m.MIN_GROUP} orang</span>
        <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-dashed border-[#b9c1cc]" />Belum cukup data</span>
      </div>
      <div className="grid gap-2.5 print:block print:space-y-2.5">
        {GROUPS.map((g) => {
          const list = AREAS.filter((a) => a.group === g.id);
          const scored = list.map((a) => m.areaValue("all", a.id, w)).filter((v): v is number => v !== null);
          const worst = Math.max(0, ...scored);
          return (
            <div key={g.id} className="overflow-hidden rounded-[14px] border border-line print:break-inside-avoid">
              <div className="flex w-full items-center justify-between gap-3 bg-[#fafbfc] px-3.5 py-2.5 text-left">
                <span className="flex items-center gap-2 font-bold" style={{ color: g.color }}><Dot color={g.color} className="size-2.5" />{g.name}<small className="font-medium text-muted">{list.length} area</small></span>
                <span className="flex items-center gap-2">
                  {scored.length ? <StatusChip s={areaStatus(worst)} small /> : <Tag>Belum cukup data</Tag>}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-[15px] print:min-w-0 print:text-[11px]">
                  <thead>
                    <tr className="text-left text-[14px] text-muted">
                      <th className="px-3 py-2 font-semibold">Area</th>
                      <th className="px-2 py-2 font-semibold">Perusahaan</th>
                      <th className="px-2 py-2 font-semibold">Arah</th>
                      {teams.map((t) => <th key={t.id} className="px-1 py-2 text-center font-semibold whitespace-nowrap">{t.name.split(" ")[0]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => {
                      const v = m.areaValue("all", a.id, w), d = m.areaDelta("all", a.id, 4, w);
                      const ch = d === null ? null : changeMeaning(d);
                      return (
                        <tr key={a.id} className="border-t border-line align-top">
                          <td className="px-3 py-2">
                            <Link href={ROUTES.hr.area(a.id)} className="font-semibold hover:text-brand">{a.name}</Link>
                            <small className="block max-w-[260px] text-[14px] leading-snug text-muted">{a.desc}</small>
                          </td>
                          <td className="px-2 py-2">
                            {v === null ? <span className="text-muted">Belum cukup data</span> : <><b className="num">{v}</b><small className="block text-[13.5px] leading-tight text-muted">{scoreMeaning(v)}</small></>}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">{d === null ? <span className="text-muted">-</span> : <><Delta d={d} /><small className="block text-[13.5px] text-muted">{ch!.label}</small></>}</td>
                          {teams.map((t) => {
                            if (m.isHidden(t.id, w)) return <td key={t.id} className="p-0.5"><span className="bg-hatch block h-8 rounded-md" title="Kurang dari 5 orang" /></td>;
                            const tv = m.areaValue(t.id, a.id, w);
                            return (
                              <td key={t.id} className="p-0.5">
                                {tv === null ? <span className="block h-8 rounded-md border border-dashed border-[#c9d0da]" title="Belum cukup data" />
                                  : <span className="num grid h-8 place-items-center rounded-md text-[14.5px] font-semibold text-ink" style={{ background: heat(tv) }} title={`${t.name}: ${tv}`}>{tv}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </Part>
  );
}

/* ---------- 3. Analysis and action plan ---------- */

function Analysis({ m, p }: { m: Model; p: Period }) {
  const w = p.w;
  const actions = topActions(m, w);
  const ranked = m.TEAMS.map((t) => ({ t, hidden: m.isHidden(t.id, w), st: m.teamStatus(t.id, w), wb: m.wellbeing(t.id, w), top: m.topAreas(t.id, 1, w)[0] }))
    .sort((a, b) => Number(a.hidden) - Number(b.hidden) || (a.wb ?? 101) - (b.wb ?? 101));
  return (
    <Part id="analisis" sub="Dari temuan ke tindakan. Bedakan temuan data, dugaan penyebab yang perlu dikonfirmasi, dan hasil konfirmasi HR.">
      <Card title="Prioritas perhatian per divisi" sub="Urut dari indeks wellbeing terendah">
        <ul className="grid gap-1.5">
          {ranked.map(({ t, hidden, st, wb, top }, i) => (
            <li key={t.id} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-[15px] sm:grid-cols-[150px_1fr_220px]">
              <Link href={ROUTES.hr.division(t.id)} className="truncate font-semibold hover:text-brand">{t.name}</Link>
              {hidden ? <span className="bg-hatch rounded-md px-2 py-1 text-[14px] text-muted">Disembunyikan, kurang dari {m.MIN_GROUP} orang</span>
                : wb === null ? <span className="text-muted">Belum cukup data</span>
                : <span className="flex items-center gap-2"><GrowBar pct={wb} color={STATUS_COLOR[st]} className="flex-1" delay={i * 60} /><b className="num w-7 text-right">{wb}</b></span>}
              <span className="hidden truncate text-muted sm:block">{!hidden && top ? <>{top.area.name} <b className="num text-ink">{top.v}</b> <StatusChip s={areaStatus(top.v)} small /></> : ""}</span>
              {!hidden && wb !== null && <span className="sm:hidden"><StatusChip s={st} small /></span>}
            </li>
          ))}
        </ul>
      </Card>
      {actions.length === 0 ? <NotEnough>Tidak ada area yang naik tajam atau masuk zona perlu perhatian bulan ini.</NotEnough> : (
        <div className="grid gap-3.5 xl:grid-cols-2">
          {actions.map((x, i) => {
            const confirmed = m.ds.notes.filter((n) => n.team === x.team.id && n.area === x.area.id && n.week <= w).sort((a, b) => b.week - a.week)[0];
            const practice = practiceById(guideOf(x.area.id).practice);
            const target = Math.max(0, Math.min(x.a.value - 5, 61));
            return (
              <Reveal key={x.a.id} delay={i * 80} className="grid content-start gap-2 rounded-card border border-line bg-white p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-[17px]"><Dot color={groupOf(x.area.group).color} className="mr-1.5" />{x.area.name} · {x.team.name}</b>
                  <StatusChip s={areaStatus(x.a.value)} small />
                </div>
                <PlanRow label="Temuan" tag={<Tag tone="info">Data</Tag>}>
                  {x.area.name} {x.a.kind === "naik" ? `naik ${x.a.delta} poin dalam 2 minggu` : "berada di zona perlu perhatian"} menjadi {x.a.value} ({scoreMeaning(x.a.value)}).
                </PlanRow>
                <PlanRow label="Perlu diperiksa" tag={<Tag tone="warn">Dugaan</Tag>}>
                  {x.top.length ? <>Dari {x.shares.n} penjawab, {listJoin(x.top.map((r) => `${r.pct}% memilih ${r.cause.label.toLowerCase()}`))}{x.other ? `, ${x.other.pct}% memilih Lainnya` : ""}. Apakah ini sesuai dengan kondisi di lapangan, misalnya data lembur, keluhan, atau pembagian shift? Perlu dikonfirmasi, belum bisa dianggap penyebab.</>
                    : "Belum ada jawaban pemicu yang cukup. Tanyakan konteks beban kerja ke lead divisi."}
                </PlanRow>
                {confirmed && (
                  <PlanRow label="Konfirmasi HR" tag={<Tag tone={NOTE_TONE[confirmed.type]}>{NOTE_LABEL[confirmed.type]}</Tag>}>{confirmed.text} <span className="text-muted">({confirmed.date})</span></PlanRow>
                )}
                <PlanRow label="Saran tindakan">
                  {x.top[0] ? CAUSES[x.top[0].cause.id].idea : "Bahas beban kerja dan waktu istirahat bersama lead divisi"}. Tawarkan latihan {practice?.title ?? "mandiri"} di aplikasi kepada karyawan divisi ini.
                </PlanRow>
                <dl className="grid grid-cols-3 gap-2 rounded-[12px] bg-canvas p-2.5 text-[14.5px]">
                  <div><dt className="text-muted">PIC</dt><dd className="font-semibold">HR dan {x.team.lead ? `lead ${x.team.name} (${x.team.lead})` : `lead ${x.team.name}`}</dd></div>
                  <div><dt className="text-muted">Waktu</dt><dd className="font-semibold">2 minggu berikutnya</dd></div>
                  <div><dt className="text-muted">Ukuran keberhasilan</dt><dd className="font-semibold">Tindakan selesai, partisipasi tetap 60%+, {x.area.name} turun ke {target} atau lebih rendah</dd></div>
                </dl>
              </Reveal>
            );
          })}
        </div>
      )}
      <Fine>Rekomendasi dibuat otomatis dari data agregat. HR perlu meninjau dan menyetujuinya sebelum dijalankan, lalu mencatat statusnya di halaman divisi.</Fine>
    </Part>
  );
}

function PlanRow({ label, tag, children }: { label: string; tag?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 text-[15px] leading-normal">
      <span className="flex items-center gap-1.5 text-[14px] font-semibold tracking-wide text-muted uppercase">{label}{tag}</span>
      <span className="text-body">{children}</span>
    </div>
  );
}

/* ---------- 4. Evaluation and follow-up ---------- */

function Evaluation({ m, p }: { m: Model; p: Period }) {
  const w = p.w;
  const notes = m.ds.notes.filter((n) => n.week >= 0 && n.week <= w).sort((a, b) => b.week - a.week);
  const uses = m.ds.programUse.filter((u) => u.startWeek <= w);
  const contacts = referralFor(m, p);
  const months = m.REFERRALS.months.slice(0, contacts.i + 1);
  const values = m.REFERRALS.byMonth.slice(0, contacts.i + 1);
  const wbNow = m.wellbeing("all", w), wbPrev = p.prev ? m.wellbeing("all", p.prev.w) : null;
  const maxRef = Math.max(1, ...values);
  const next = topActions(m, w).slice(0, 3);
  return (
    <Part id="evaluasi" sub="Apa yang sudah dijalankan dan bagaimana hasilnya. Status tindakan diisi HR; partisipasi, penyelesaian latihan, dan perubahan skor dihitung aplikasi.">
      <div className="grid gap-3.5 xl:grid-cols-2">
        <Card title="Pelaksanaan tindakan HR" sub="Dari catatan HR per divisi, dengan perubahan skor sejak dicatat">
          {notes.length === 0 ? <NotEnough href={ROUTES.hr.divisions} cta="Tambah catatan di halaman divisi">Belum ada tindakan yang dicatat.</NotEnough> : (
            <ul className="grid gap-2">
              {notes.slice(0, 6).map((n) => {
                const before = n.area ? m.areaValue(n.team, n.area, Math.max(0, n.week - 1)) : null, now = n.area ? m.areaValue(n.team, n.area, w) : null;
                const d = before !== null && now !== null && n.week < w ? now - before : null;
                return (
                  <li key={n.id} className="grid gap-1 border-t border-line pt-2 text-[15px] first:border-t-0 first:pt-0">
                    <span className="flex flex-wrap items-center gap-1.5"><Tag tone={NOTE_TONE[n.type]}>{NOTE_LABEL[n.type]}</Tag><b>{m.teamById(n.team)?.name}</b>{n.area && <span className="text-muted">· {areaById(n.area).name}</span>}<span className="text-muted">· {n.date}</span></span>
                    <span className="text-body">{n.text}</span>
                    {n.area && (d === null ? <small className="text-muted">Perubahan skor: belum cukup data sejak dicatat.</small>
                      : <small className="text-muted">{areaById(n.area).name}: {before} → {now} (<Delta d={d} />, {changeMeaning(d).label.toLowerCase()})</small>)}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Program di aplikasi" sub="Jangkauan peserta, penyelesaian, dan perubahan skor pada peserta yang punya data sebelum dan sesudah">
          {uses.length === 0 ? <NotEnough>Belum ada program yang dijalankan di periode ini.</NotEnough> : (
            <ul className="grid gap-3.5">
              {uses.map((u, i) => {
                const prog = programById(u.program), team = m.teamById(u.team);
                const enough = u.before !== null && u.after !== null && u.paired >= m.MIN_GROUP;
                const d = enough ? u.after! - u.before! : null;
                return (
                  <li key={`${u.team}-${u.program}`} className="grid gap-1.5 text-[15px]">
                    <b>{prog?.title ?? u.program} · {team?.name}</b>
                    <Funnel label="Diajak" n={u.invited} of={u.invited} color="#b8c9e6" delay={i * 90} />
                    <Funnel label="Mulai" n={u.started} of={u.invited} color="#6f9be0" delay={i * 90 + 80} />
                    <Funnel label="Selesai" n={u.finished} of={u.invited} color="#0a66f5" delay={i * 90 + 160} />
                    {enough ? <span className="text-body">{areaById(u.area).name} pada {u.paired} peserta: {u.before} → {u.after} (<Delta d={d!} />, {changeMeaning(d!, u.paired).label.toLowerCase()}).</span>
                      : <span className="text-muted">Perubahan skor: belum cukup data ({u.paired} peserta punya data sebelum dan sesudah, butuh minimal {m.MIN_GROUP}).</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <div className="grid gap-3.5 xl:grid-cols-[1fr_1.2fr]">
        <Card title="Kontak psikolog per bulan" sub="Jumlah karyawan yang menghubungi psikolog mitra, tanpa identitas">
          {contacts.n === null ? <NotEnough>Belum ada data kontak untuk bulan ini.</NotEnough> : (
            <div className="flex h-[120px] items-end gap-4 pt-2">
              {values.map((v, i) => (
                <div key={months[i]} className="grid justify-items-center gap-1">
                  <b className="num text-[15px]">{v}</b>
                  <span className="block w-[34px] origin-bottom animate-[rise_.7s_ease-out_both] rounded-t-md rounded-b-sm print:animate-none" style={{ height: `${(v / maxRef) * 64 + 4}px`, background: i === values.length - 1 ? "#0A66F5" : "#CFD8E3", animationDelay: `${i * 90}ms` }} />
                  <em className="text-[14px] text-muted not-italic">{months[i]}</em>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Cara membaca kontak psikolog" sub="Bukan ukuran keberhasilan tunggal">
          <ul className="grid list-disc gap-1.5 pl-[18px] text-[15px] leading-normal text-body">
            {contacts.n !== null && <li>Bulan ini {contacts.n} kontak ({contacts.rate} per 100 karyawan){contacts.prev !== null ? `, bulan sebelumnya ${contacts.prev}` : ""}.</li>}
            <li>Kenaikan bisa berarti kondisi memburuk, tetapi juga bisa berarti karyawan makin tahu dan berani memakai layanan. Penurunan belum tentu berarti kondisi membaik.</li>
            <li>Baca bersama indeks wellbeing{wbNow !== null && wbPrev !== null ? ` (${wbPrev} → ${wbNow}, ${changeMeaning(wbNow - wbPrev).label.toLowerCase()})` : ""} dan partisipasi check-in: kontak naik saat wellbeing stabil lebih mungkin menandakan akses yang membaik.</li>
            <li>Aplikasi mengutamakan latihan mandiri dan Asisten AI. Kontak psikolog adalah pilihan tambahan, bukan target.</li>
          </ul>
        </Card>
      </div>
      <Card title="Prioritas periode berikutnya">
        {next.length === 0 ? <p className="text-[15.5px] text-muted">Pertahankan program yang berjalan dan lakukan pengukuran ulang bulan depan.</p> : (
          <ul className="grid list-disc gap-1.5 pl-[18px] text-[15.5px]">
            {next.map((x) => <li key={x.a.id}>Ukur ulang {x.area.name} di {x.team.name} setelah tindakan berjalan 2 minggu, dan catat statusnya.</li>)}
            {m.TEAMS.some((t) => !m.isHidden(t.id, w) && m.part(t.id, w) < 60) && <li>Naikkan partisipasi check-in di divisi yang di bawah 60% agar skornya mewakili.</li>}
          </ul>
        )}
      </Card>
    </Part>
  );
}

function Funnel({ label, n, of, color, delay }: { label: string; n: number; of: number; color: string; delay: number }) {
  return (
    <span className="grid grid-cols-[56px_1fr_70px] items-center gap-2">
      <small className="text-muted">{label}</small>
      <GrowBar pct={(n / Math.max(1, of)) * 100} color={color} delay={delay} />
      <small className="num text-right"><b>{n}</b> orang</small>
    </span>
  );
}

/* ---------- Basis ---------- */

function Basis({ m }: { m: Model }) {
  return (
    <section className="grid gap-2 rounded-[14px] bg-canvas p-3.5 text-[14.5px] leading-normal text-body">
      <b className="text-[15.5px] text-ink">Dasar interpretasi skor</b>
      <ul className="grid list-disc gap-1 pl-[18px]">{SCORE_BASIS.map((t) => <li key={t}>{t}</li>)}</ul>
      <p>Kategori indeks: {WELLBEING_BANDS.map((b) => `${b.label} ${b.min}+`).join(", ")}. Status area: {STATUS_LABEL.baik} di bawah 52, {STATUS_LABEL.waspada} 52 sampai 61, {STATUS_LABEL.perhatian} 62 ke atas.</p>
      <p className="text-muted">Semua angka adalah agregat kelompok minimal {m.MIN_GROUP} orang. Data kosong ditampilkan sebagai &ldquo;belum cukup data&rdquo;, bukan nol. Skor area adalah sinyal skrining, bukan diagnosis.{!m.live && " Perusahaan dan angka di demo ini adalah contoh."}</p>
    </section>
  );
}
