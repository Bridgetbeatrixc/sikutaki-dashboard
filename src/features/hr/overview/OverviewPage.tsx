"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Fine } from "@/components/ui/Card";
import { Dot, StatusChip, Tag } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { Icon } from "@/components/ui/Icon";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompareBars } from "@/components/charts/CompareBars";
import { fitRange, LineChart } from "@/components/charts/LineChart";
import { MoodBar } from "@/components/charts/MoodBar";
import { AREA_COUNT, areaById, groupOf, NOTE_LABEL, wellbeingBand } from "@/lib/catalog";
import { decimal } from "@/lib/format";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";
import { NOTE_TONE } from "../noteTone";
import { LiveSummary } from "./LiveSummary";
import { Onboarding } from "./Onboarding";

export function OverviewPage() {
  const { m } = useHr();
  const router = useRouter();
  if (m.isEmpty) return <Onboarding />;

  const { NOW, TEAMS, REFERRALS, ds } = m;
  const notes = ds.notes;
  const weekLabels = m.WEEKS.map((w) => w.label);
  const wb = m.wellbeing("all"), part = m.participation("all");
  const mood = m.moodAvg("all"), sleep = m.sleepHours("all");
  const visible = TEAMS.filter((t) => !m.isHidden(t.id));
  const attention = visible.filter((t) => m.teamStatus(t.id) === "perhatian");
  const hiddenTeams = TEAMS.filter((t) => m.isHidden(t.id));
  const wbs = m.wellbeingSeries("all");
  const top = m.topCompanyAreas(5);
  const sleeps = m.sleepSeries("all");
  const diff = (a: number | null, b: number | null, k = 1) => (a === null || b === null ? undefined : Math.round((a - b) * k) / k);

  const rows = TEAMS.map((t) => {
    const hidden = m.isHidden(t.id);
    const focus = hidden ? undefined : m.focusAreas(t.id)[0];
    const cause = focus ? m.causeShares(t.id, focus.area).rows[0] : undefined;
    const last = notes.filter((n) => n.team === t.id).sort((a, b) => b.week - a.week)[0];
    return { t, hidden, focus, cause, last, wb: m.wellbeing(t.id), st: m.teamStatus(t.id) };
  }).sort((a, b) => Number(a.hidden) - Number(b.hidden) || (a.wb ?? 101) - (b.wb ?? 101));

  const doneMarkers = notes.filter((n) => n.type === "dilakukan" && n.week >= 0 && n.week <= NOW).sort((a, b) => a.week - b.week)
    .map((n) => ({ i: n.week, label: m.teamById(n.team)?.name ?? "Divisi" }));

  return (
    <>
      <PageHeader title="Beranda" sub={<>Minggu {m.WEEKS[NOW].label} · {m.respondentsScope("all")} dari {m.sizeScope("all")} karyawan mengisi check-in</>} />
      <LiveSummary />

      <KpiGrid cols={3}>
        <Kpi label="Indeks wellbeing" value={wb ?? "Belum cukup data"} unit={wb === null ? undefined : "/100"} delta={diff(wb, m.wellbeing("all", NOW - 1))} goodWhenUp
          foot={wb === null ? `Tampil setelah ${m.MIN_GROUP} orang mengisi check-in` : <span className="inline-flex flex-wrap items-center gap-1.5"><StatusChip s={wellbeingBand(wb).status} small />{wellbeingBand(wb).label} · <Link href={ROUTES.hr.reports} className="font-semibold text-brand">arti skor</Link></span>} />
        <Kpi label="Partisipasi check-in" value={part} unit="%" delta={diff(part, m.participationSeries("all")[NOW - 1] ?? null)} goodWhenUp foot={`${m.respondentsScope("all")} dari ${m.sizeScope("all")} orang`} />
        <Kpi label="Divisi perlu perhatian" value={attention.length} foot={attention.length ? attention.map((t) => t.name).join(", ") : `dari ${visible.length} divisi`} />
        <Kpi label="Rata-rata mood harian" value={mood === null ? "-" : decimal(mood)} unit={mood === null ? undefined : "/5"} delta={diff(mood, m.moodAvg("all", NOW - 1), 10)} goodWhenUp
          foot={mood === null ? `Tampil mulai ${m.MIN_GROUP} orang mencatat` : `${m.dailyActive("all")}% karyawan mencatat minggu ini`} />
        <Kpi label="Rata-rata jam tidur" value={sleep === null ? "-" : decimal(sleep)} unit={sleep === null ? undefined : " jam"} delta={diff(sleep, m.sleepHours("all", NOW - 4), 10)} goodWhenUp foot="dibanding 4 minggu lalu" />
        <Kpi label="Kontak psikolog" value={REFERRALS.thisMonth} foot={`bulan ini, bulan lalu ${REFERRALS.lastMonth}. Baca bersama wellbeing, bukan ukuran keberhasilan tunggal`} />
      </KpiGrid>

      <div className="grid items-start gap-[18px] xl:grid-cols-[1.6fr_1fr]">
        <Card title="Indeks wellbeing 12 minggu" sub="Makin tinggi makin baik. Garis putus-putus = catatan HR yang sudah dilakukan.">
          <LineChart series={[{ name: "Indeks wellbeing", color: "#0A66F5", values: wbs }]} labels={weekLabels} {...fitRange(wbs)} height={230} markers={doneMarkers} />
        </Card>
        <Card title="Mood harian minggu ini" sub="Dari check-in mood harian di aplikasi karyawan">
          {mood === null ? <HiddenNote text={`Tampil setelah minimal ${m.MIN_GROUP} karyawan mencatat mood minggu ini`} /> : (
            <>
              <div className="flex items-baseline gap-2.5"><b className="num text-[40px] font-bold text-head">{decimal(mood)}</b><span className="text-[13px] text-muted">rata-rata dari 5</span></div>
              <MoodBar pct={m.moodDist("all") ?? [0, 0, 0, 0, 0]} />
            </>
          )}
        </Card>
      </div>

      <Card flush title={<span className="block px-3.5 pt-3.5 sm:px-5 sm:pt-[18px]">Fokus per divisi</span>}
        sub={<span className="block px-3.5 sm:px-5">Area yang paling perlu perhatian di tiap divisi, penyebab menurut karyawan, dan catatan HR terakhir</span>}
        action={<Link href={ROUTES.hr.divisions} className="mt-3.5 mr-3.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap text-brand sm:mt-[18px] sm:mr-5">Semua divisi <Icon name="arrow" size={14} /></Link>}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="hidden md:table-header-group">
              <tr className="border-y border-line bg-[#fafbfc] text-left text-xs text-muted">
                {["Divisi", "Wellbeing", "Fokus utama", "Penyebab teratas", "Catatan HR terakhir", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.t.id} onClick={() => router.push(ROUTES.hr.division(r.t.id))}
                  className="grid cursor-pointer grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line px-3.5 py-3 align-top hover:bg-[#f7f8fb] md:table-row md:p-0 [&>td]:md:px-4 [&>td]:md:py-3 [&>td]:md:align-top">
                  <td className="col-span-2">
                    <Link href={ROUTES.hr.division(r.t.id)} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline">{r.t.name}</Link>
                    <small className="block text-muted">{r.t.size} orang terdaftar</small>
                  </td>
                  {r.hidden ? <td colSpan={4} className="col-span-2"><HiddenNote /></td> : (
                    <>
                      <td>{r.wb === null ? <span className="text-muted">Belum cukup data</span> : <><b className="num">{r.wb}</b> <StatusChip s={r.st} small /></>}</td>
                      <td>{r.focus
                        ? <span className="inline-flex flex-wrap items-center gap-1.5"><Dot color={groupOf(areaById(r.focus.area).group).color} />{areaById(r.focus.area).name} <b className="num">{r.focus.v}</b> <Delta d={r.focus.d} /></span>
                        : <span className="text-muted">Tidak ada, semua area baik</span>}</td>
                      <td>{r.cause ? <>{r.cause.cause.label} <span className="num text-muted">{r.cause.pct}%</span></> : <span className="text-muted">-</span>}</td>
                      <td className="col-span-2">{r.last
                        ? <><Tag tone={NOTE_TONE[r.last.type]}>{NOTE_LABEL[r.last.type]}</Tag><span className="mt-1 line-clamp-2 max-w-xs text-[12.5px] text-body">{r.last.text}</span></>
                        : <span className="text-muted">Belum ada catatan</span>}</td>
                    </>
                  )}
                  <td className="hidden w-9 text-muted md:table-cell"><Icon name="arrow" size={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Wellbeing per divisi" sub="Garis kecil = rata-rata perusahaan. Makin panjang makin baik.">
          <CompareBars onSelect={(id) => router.push(ROUTES.hr.division(id))}
            items={visible.flatMap((t) => { const v = m.wellbeing(t.id); return v === null ? [] : [{ id: t.id, label: t.name, color: "#3B8EF7", v, ref: wb ?? undefined }]; }).sort((a, b) => a.v - b.v)} />
          {hiddenTeams.length > 0 && <HiddenNote text={`${hiddenTeams.map((t) => t.name).join(", ")}: disembunyikan, kurang dari 5 orang`} />}
        </Card>
        <Card title="Area tertinggi di perusahaan" sub="Skor 0 sampai 100 = rata-rata seberapa sering dialami (50 = kadang-kadang, 75 = sering). Makin tinggi makin perlu perhatian. Perubahan dibanding 4 minggu lalu."
          action={<Link href={ROUTES.hr.areas} className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-brand">{AREA_COUNT} area <Icon name="arrow" size={14} /></Link>}>
          <CompareBars onSelect={(id) => router.push(ROUTES.hr.area(id))} items={top.map((x) => ({ id: x.area.id, label: x.area.name, color: groupOf(x.area.group).color, v: x.v }))} />
          <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] text-muted">{top.map((x) => <li key={x.area.id}>{x.area.name} {x.d === null ? <span className="text-muted">baru diukur</span> : <Delta d={x.d} />}</li>)}</ul>
        </Card>
      </div>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Partisipasi check-in 12 minggu" sub="Di bawah 60% skor divisi kurang mewakili">
          <LineChart series={[{ name: "Partisipasi", color: "#2F6BD8", values: m.participationSeries("all") }]} labels={weekLabels} min={0} max={100} height={170} unit="%" />
        </Card>
        <Card title="Rata-rata jam tidur 12 minggu" sub="Dari check-in harian, dalam jam per malam">
          {sleeps.some((v) => v !== null)
            ? <LineChart series={[{ name: "Jam tidur", color: "#C27510", values: sleeps }]} labels={weekLabels} min={4} max={9} height={170} unit=" jam" />
            : <HiddenNote text={`Tampil setelah minimal ${m.MIN_GROUP} karyawan mencatat jam tidur`} />}
        </Card>
      </div>
      <Fine>Skor area adalah sinyal skrining dari check-in mingguan, bukan diagnosis. Semua angka adalah rata-rata kelompok minimal {m.MIN_GROUP} orang.{!m.live && " Perusahaan dan angka di demo ini adalah contoh."}</Fine>
    </>
  );
}
