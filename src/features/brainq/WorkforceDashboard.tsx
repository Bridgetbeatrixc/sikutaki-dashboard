"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LineChart, fitRange } from "@/components/charts/LineChart";
import { cn } from "@/lib/cn";
import {
  DOMAINS, DOMAIN_ADVICE, STABLE, bottleneckAction, bottleneckLabel, cycleLong, cycleShort, lowestDomain, teamRows,
  type CycleAgg, type Dashboard, type TeamRow,
} from "./model";

const PURPLE = "#7c5ce0", REF = "#a9a3bd";
const PARTICIPATION_TARGET = 80;

export function WorkforceDashboard({ code, data, error }: { code: string; data: Dashboard | null; error: string }) {
  if (!data || data.cycles.length === 0) return <NoData code={code} error={error} found={Boolean(data)} />;
  return <Loaded code={code} data={data} />;
}

function Loaded({ code, data }: { code: string; data: Dashboard }) {
  const cycles = data.cycles;
  const [ci, setCi] = useState(cycles.length - 1);
  const [trendTeam, setTrendTeam] = useState("all");
  const cur = cycles[ci];
  const prev = ci > 0 ? cycles[ci - 1] : null;
  const rows = useMemo(() => teamRows(data, cur.cycle_date, prev?.cycle_date ?? null, cur), [data, cur, prev]);
  const attention = rows.filter((r) => r.reasons.length > 0).sort((a, b) => a.now!.score - b.now!.score);
  const participation = Math.round((100 * cur.n) / Math.max(1, data.headcount));
  const topBottleneck = cur.bottlenecks[0];
  const topShare = topBottleneck ? Math.round((100 * topBottleneck.n) / cur.n) : 0;
  const low = lowestDomain(cur);
  const demo = code === "DEMO";

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 pt-6 sm:px-6 sm:pt-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-bq-deep">
            {data.company}
            {demo && <span className="rounded-full bg-bq-mist px-2 py-0.5 text-[11.5px] font-bold text-bq-plum">Data contoh</span>}
          </p>
          <h1 className="mt-1.5 text-[28px] font-bold tracking-tight sm:text-[36px]">Tim mana yang perlu perhatian?</h1>
          <p className="mt-1.5 max-w-2xl text-[14.5px] text-bq-ink-2">
            Ringkasan BrainQ Pulse {cycleLong(cur.cycle_date)}. Perusahaan hanya melihat angka per tim; hasil pribadi tetap milik karyawan.
          </p>
        </div>
        <label className="grid gap-1 text-[12px] font-semibold text-bq-ink-3">
          Siklus Pulse
          <select value={ci} onChange={(e) => setCi(Number(e.target.value))}
            className="rounded-xl border border-bq-line bg-white px-3 py-2 text-[14px] font-semibold text-bq-ink">
            {cycles.map((c, i) => <option key={c.cycle_date} value={i}>{cycleLong(c.cycle_date)}{i === cycles.length - 1 ? " (terbaru)" : ""}</option>)}
          </select>
        </label>
      </section>

      <Summary cur={cur} prev={prev} attention={attention.length} participation={participation} />

      {/* 1. Exceptions first: the teams that need a decision this cycle. */}
      <section className="grid gap-3">
        <h2 className="text-[17px] font-bold">
          {attention.length === 0 ? "Tidak ada tim yang perlu perhatian khusus" : `${attention.length} tim perlu perhatian`}
        </h2>
        {attention.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {attention.map((r) => <AttentionCard key={r.team.id} row={r} />)}
          </div>
        )}
      </section>

      {/* 2. Headline numbers with their change. */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Partisipasi" value={`${participation}%`} foot={`${cur.n} dari ${data.headcount} karyawan, target ${PARTICIPATION_TARGET}%`}
          tone={participation >= PARTICIPATION_TARGET ? "good" : "warn"} />
        <Stat label="Rata-rata BrainQ" value={String(cur.score)} unit="/100" delta={prev ? cur.score - prev.score : undefined} goodWhenUp
          foot="Skor gabungan 6 area otak" />
        <Stat label="Brain fog risk tinggi" value={`${cur.fog_high}%`} delta={prev ? cur.fog_high - prev.fog_high : undefined}
          foot="Peserta dengan risiko tinggi" />
        <Stat label="Penghambat terbanyak" value={topBottleneck ? `${topShare}%` : "-"} small
          foot={topBottleneck ? bottleneckLabel(topBottleneck.bottleneck) : "Belum ada data"} />
      </section>

      <Trend data={data} upTo={ci} team={trendTeam} setTeam={setTrendTeam} />

      <section className="grid gap-5 lg:grid-cols-2">
        <Card title="Brain 6 Map perusahaan" sub="Rata-rata seluruh peserta. Area terendah ditandai lebih gelap.">
          <div className="grid gap-2.5">
            {DOMAINS.map((d) => (
              <Bar key={d.key} label={<><b className="mr-1.5 inline-grid size-5 place-items-center rounded-md bg-bq-mist text-[11px] text-bq-plum">{d.letter}</b>{d.name}</>}
                hint={d.meaning} value={cur[d.key]} dark={d.key === low.key} prev={prev?.[d.key]} />
            ))}
          </div>
          <Advice>{DOMAIN_ADVICE[low.key]}</Advice>
        </Card>

        <Card title="Penghambat utama karyawan" sub="Satu penghambat terbesar per orang, dari hasil scan. Persen dari peserta siklus ini.">
          <div className="grid gap-2.5">
            {cur.bottlenecks.slice(0, 5).map((b, i) => (
              <Bar key={b.bottleneck} label={bottleneckLabel(b.bottleneck)} value={Math.round((100 * b.n) / cur.n)} unit="%" dark={i === 0} />
            ))}
            {cur.bottlenecks.length > 5 && (
              <p className="text-[12px] text-bq-ink-3">
                Lainnya: {Math.round((100 * cur.bottlenecks.slice(5).reduce((s, b) => s + b.n, 0)) / cur.n)}%
              </p>
            )}
          </div>
          {topBottleneck && <Advice>Langkah untuk seluruh perusahaan: {bottleneckAction(topBottleneck.bottleneck)}</Advice>}
        </Card>
      </section>

      <TeamTable rows={rows} minGroup={data.minGroup} company={cur} />

      <Readiness rows={rows} company={cur} />

      <section className="grid gap-5 lg:grid-cols-2">
        <Card title="Aturan privasi Workforce">
          <ul className="grid list-disc gap-1.5 pl-5 text-[13.5px] text-bq-ink-2">
            <li>Perusahaan tidak bisa membuka hasil individu. Tidak ada nama di dashboard ini, dan database tidak menyimpan identitas.</li>
            <li>Tim dengan kurang dari {data.minGroup} peserta pada satu siklus tidak ditampilkan, termasuk jumlah pesertanya. Jawabannya tetap masuk ke angka perusahaan.</li>
            <li>Jawaban cek keamanan (tanda bahaya medis) tidak pernah disimpan atau dilaporkan. Karyawan diarahkan langsung ke dokter.</li>
            <li>Data tidak dipakai untuk penilaian kinerja, promosi, atau PHK.</li>
          </ul>
        </Card>
        <Card title="Cara membaca">
          <ul className="grid list-disc gap-1.5 pl-5 text-[13.5px] text-bq-ink-2">
            <li>Karyawan mengisi Pulse setiap 2 minggu (tanggal 1–14 dan 15–akhir bulan). Setiap angka adalah rata-rata siklus itu.</li>
            <li>Perubahan di bawah {STABLE} poin ditulis <i>stabil</i>, karena wajar naik turun sedikit.</li>
            <li>Tim masuk daftar perhatian bila skornya 5 poin atau lebih di bawah rata-rata perusahaan, turun {STABLE} poin atau lebih, atau brain fog risk tinggi pada 35% peserta atau lebih.</li>
            <li>BrainQ adalah sinyal kebiasaan dan kondisi kerja, bukan diagnosis medis.</li>
          </ul>
        </Card>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-bq-plum px-5 py-5 text-white sm:px-7">
        <div>
          <h2 className="text-[18px] font-bold text-white">Bagikan scan ke karyawan</h2>
          <p className="mt-1 text-[14px] text-bq-lilac">Karyawan memilih timnya, mengisi 20 pertanyaan, dan langsung mendapat hasil pribadinya. Dashboard ini ikut diperbarui.</p>
        </div>
        <Link href={`/brainq/scan?kode=${encodeURIComponent(code)}`} className="rounded-full bg-white px-5 py-2.5 text-[14px] font-bold text-bq-plum hover:bg-bq-mist">
          Buka halaman scan
        </Link>
      </section>
    </main>
  );
}

function Summary({ cur, prev, attention, participation }: { cur: CycleAgg; prev: CycleAgg | null; attention: number; participation: number }) {
  const d = prev ? cur.score - prev.score : 0;
  const change = !prev ? "" : Math.abs(d) < STABLE ? ", stabil dibanding siklus lalu" : d > 0 ? `, naik ${d} poin dari siklus lalu` : `, turun ${-d} poin dari siklus lalu`;
  return (
    <p className="rounded-2xl border border-bq-line bg-white px-4 py-3.5 text-[15px] leading-relaxed sm:px-5">
      Rata-rata BrainQ <b>{cur.score}</b>{change}. {attention === 0 ? "Tidak ada tim yang perlu perhatian khusus" : <><b>{attention} tim</b> perlu perhatian</>}
      {cur.bottlenecks[0] && <>, dan penghambat terbanyak adalah <b>{bottleneckLabel(cur.bottlenecks[0].bottleneck).toLowerCase()}</b></>}.
      {participation < PARTICIPATION_TARGET && <> Partisipasi {participation}% masih di bawah target {PARTICIPATION_TARGET}%, jadi baca angka dengan hati-hati.</>}
    </p>
  );
}

function AttentionCard({ row }: { row: TeamRow }) {
  const now = row.now!;
  return (
    <article className="grid content-start gap-2.5 rounded-[18px] border border-bq-line bg-white p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold">{row.team.name}</h3>
          <p className="text-[12.5px] text-bq-ink-3">{now.n} dari {row.team.headcount} orang mengisi</p>
        </div>
        <div className="text-right">
          <b className="num text-[26px] leading-none font-bold">{now.score}</b>
          <div className="mt-1"><Delta d={row.delta} goodWhenUp /></div>
        </div>
      </header>
      <ul className="grid gap-1 text-[13px] text-[#b4361f]">
        {row.reasons.map((r) => <li key={r} className="flex gap-1.5"><span aria-hidden>•</span>{r}</li>)}
      </ul>
      <p className="text-[13px] text-bq-ink-2">
        Penghambat utama: <b className="text-bq-ink">{bottleneckLabel(now.bottleneck)}</b> ({now.bottleneck_share}% anggota)
      </p>
      <p className="rounded-xl bg-bq-mist px-3 py-2 text-[13px] text-bq-plum"><b>Langkah:</b> {bottleneckAction(now.bottleneck)}</p>
    </article>
  );
}

function Trend({ data, upTo, team, setTeam }: { data: Dashboard; upTo: number; team: string; setTeam: (t: string) => void }) {
  const cycles = data.cycles.slice(0, upTo + 1);
  const labels = cycles.map((c) => cycleShort(c.cycle_date));
  const company = cycles.map((c) => c.score);
  const picked = data.teams.find((t) => t.id === team);
  const teamValues = picked
    ? cycles.map((c) => {
        const tc = data.teamCycles.find((x) => x.team_id === picked.id && x.cycle_date === c.cycle_date);
        return tc && !tc.hidden ? tc.score : null;
      })
    : [];
  const series = picked
    ? [{ name: picked.name, color: PURPLE, values: teamValues }, { name: "Perusahaan", color: REF, values: company }]
    : [{ name: "Rata-rata BrainQ", color: PURPLE, values: company }];
  const { min, max } = fitRange([...company, ...teamValues], 8);
  const hiddenAll = picked && teamValues.every((v) => v === null);

  return (
    <Card title="Rata-rata BrainQ per siklus" sub={picked ? `${picked.name} dibanding rata-rata perusahaan. Sumbu dimulai dari ${min}.` : `Seluruh peserta, per Pulse 2 mingguan. Sumbu dimulai dari ${min}.`}
      action={
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Pilih tim"
          className="rounded-xl border border-bq-line bg-white px-3 py-1.5 text-[13px] font-semibold">
          <option value="all">Seluruh perusahaan</option>
          {data.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      }>
      {cycles.length < 2 ? (
        <p className="text-[13.5px] text-bq-ink-3">Tren muncul setelah ada dua siklus Pulse.</p>
      ) : hiddenAll ? (
        <p className="bg-hatch rounded-xl px-4 py-8 text-center text-[13.5px] text-bq-ink-2">Tim ini selalu di bawah {data.minGroup} peserta, jadi trennya disembunyikan.</p>
      ) : (
        <LineChart series={series} labels={labels} min={min} max={max} height={230} tipPrefix="Siklus " />
      )}
      {picked && !hiddenAll && teamValues.some((v) => v === null) && (
        <p className="text-[12px] text-bq-ink-3">Garis terputus pada siklus dengan kurang dari {data.minGroup} peserta.</p>
      )}
    </Card>
  );
}

function TeamTable({ rows, minGroup, company }: { rows: TeamRow[]; minGroup: number; company: CycleAgg }) {
  const sorted = [...rows].sort((a, b) => (a.now ? a.now.score : 999) - (b.now ? b.now.score : 999));
  return (
    <Card title="Semua tim, dari skor terendah" sub={`Angka di bawah 50 ditandai merah. Baris abu-abu: kurang dari ${minGroup} peserta.`} flush>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="border-y border-bq-line bg-bq-bg text-[11.5px] font-semibold text-bq-ink-3">
            <tr>
              <th className="px-4 py-2.5 sm:px-5">Tim</th>
              <th className="px-2 py-2.5">Peserta</th>
              <th className="px-2 py-2.5">BrainQ</th>
              <th className="px-2 py-2.5">vs siklus lalu</th>
              <th className="px-2 py-2.5">Fog tinggi</th>
              {DOMAINS.map((d) => <th key={d.key} className="px-2 py-2.5 text-center" title={d.name}>{d.letter}</th>)}
              <th className="px-2 py-2.5 pr-4 sm:pr-5">Penghambat utama</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => r.now ? (
              <tr key={r.team.id} className="border-b border-bq-line last:border-0">
                <td className="px-4 py-2.5 font-semibold sm:px-5">
                  {r.team.name}
                  {r.reasons.length > 0 && <span className="ml-2 rounded-full bg-[#fdece8] px-1.5 py-0.5 text-[10.5px] font-bold text-[#b4361f]">perhatian</span>}
                </td>
                <td className="num px-2 py-2.5 text-bq-ink-2">{r.now.n}/{r.team.headcount}</td>
                <td className="num px-2 py-2.5 text-[15px] font-bold"><Low v={r.now.score} /></td>
                <td className="px-2 py-2.5"><Delta d={r.delta} goodWhenUp /></td>
                <td className={cn("num px-2 py-2.5", r.now.fog_high >= 35 && "font-bold text-[#b4361f]")}>{r.now.fog_high}%</td>
                {DOMAINS.map((d) => <td key={d.key} className="num px-2 py-2.5 text-center"><Low v={r.now![d.key]} /></td>)}
                <td className="px-2 py-2.5 pr-4 text-bq-ink-2 sm:pr-5">{bottleneckLabel(r.now.bottleneck)}</td>
              </tr>
            ) : (
              <tr key={r.team.id} className="border-b border-bq-line last:border-0">
                <td className="px-4 py-2.5 font-semibold text-bq-ink-2 sm:px-5">{r.team.name}</td>
                <td colSpan={11} className="bg-hatch px-3 py-2.5 text-[12.5px] text-bq-ink-2">
                  Disembunyikan: kurang dari {minGroup} peserta, hasil bisa menebak individu
                </td>
              </tr>
            ))}
            <tr className="border-t border-bq-line bg-bq-bg font-semibold">
              <td className="px-4 py-2.5 sm:px-5">Seluruh perusahaan</td>
              <td className="num px-2 py-2.5">{company.n}</td>
              <td className="num px-2 py-2.5 text-[15px] font-bold">{company.score}</td>
              <td />
              <td className="num px-2 py-2.5">{company.fog_high}%</td>
              {DOMAINS.map((d) => <td key={d.key} className="num px-2 py-2.5 text-center">{company[d.key]}</td>)}
              <td className="px-2 py-2.5 pr-4 sm:pr-5">{company.bottlenecks[0] ? bottleneckLabel(company.bottlenecks[0].bottleneck) : "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="px-4 pb-4 text-[12px] text-bq-ink-3 sm:px-5">H Health · F Focus · M Memory · T Thinking · G Growth · A Adaptability</p>
    </Card>
  );
}

/** Cognitive Readiness Gap: how far the brain's readiness is from what the job demands. */
function Readiness({ rows, company }: { rows: TeamRow[]; company: CycleAgg }) {
  const shown = rows.filter((r) => r.now).map((r) => ({ name: r.team.name, demand: r.now!.demand, ready: r.now!.readiness }))
    .sort((a, b) => (a.ready - a.demand) - (b.ready - b.demand));
  return (
    <Card title="Cognitive Readiness Gap per tim" sub="Garis tipis: tuntutan pekerjaan. Batang: kesiapan otak saat ini. Makin jauh jaraknya, makin berat beban tim.">
      <div className="grid gap-3">
        {[{ name: "Seluruh perusahaan", demand: company.demand, ready: company.readiness }, ...shown].map((t, i) => {
          const gap = t.ready - t.demand;
          return (
            <div key={t.name} className="grid grid-cols-[minmax(0,130px)_1fr_52px] items-center gap-3 sm:grid-cols-[170px_1fr_60px]">
              <span className={cn("truncate text-[13px]", i === 0 ? "font-bold" : "font-medium")}>{t.name}</span>
              <div className="relative h-3.5 rounded-full bg-bq-mist">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${t.ready}%`, background: i === 0 ? "#3e2a8f" : PURPLE }} />
                <div className="absolute -inset-y-1 w-0.5 rounded bg-bq-ink" style={{ left: `calc(${t.demand}% - 1px)` }} title={`Tuntutan ${t.demand}`} />
              </div>
              <span className={cn("num text-right text-[13px] font-bold", gap <= -20 ? "text-[#b4361f]" : "text-bq-ink-2")}>{gap > 0 ? `+${gap}` : gap}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NoData({ code, error, found }: { code: string; error: string; found: boolean }) {
  return (
    <main className="mx-auto grid max-w-md gap-4 px-4 py-20 text-center">
      <h1 className="text-[28px] font-bold">{found ? "Belum ada hasil scan" : "Kode perusahaan tidak ditemukan"}</h1>
      <p className="text-[14.5px] text-bq-ink-2">
        {error ? `Data belum bisa dimuat: ${error}` : found ? "Dashboard muncul setelah karyawan mengisi scan." : `Tidak ada perusahaan dengan kode ${code}.`}
      </p>
      <form action="/brainq" className="flex gap-2">
        <input name="kode" defaultValue={found ? code : ""} placeholder="Kode perusahaan" className="min-w-0 flex-1 rounded-xl border border-bq-line bg-white px-3 py-2.5 text-[14px] uppercase" />
        <button className="rounded-xl bg-bq-purple px-4 font-semibold text-white">Buka</button>
      </form>
      <Link href="/brainq?kode=DEMO" className="text-[13.5px] font-semibold text-bq-deep underline">Lihat perusahaan contoh</Link>
    </main>
  );
}

/* ---------- small pieces ---------- */

function Card({ title, sub, action, children, flush }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; flush?: boolean }) {
  return (
    <section className={cn("grid min-w-0 content-start gap-4 rounded-[20px] border border-bq-line bg-white", flush ? "overflow-hidden pt-4" : "p-4 sm:p-5")}>
      <header className={cn("flex flex-wrap items-start justify-between gap-3", flush && "px-4 sm:px-5")}>
        <div>
          <h2 className="text-[16px] font-bold">{title}</h2>
          {sub && <p className="mt-0.5 text-[12.5px] text-bq-ink-3">{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value, unit, delta, goodWhenUp = false, foot, tone, small }: {
  label: string; value: string; unit?: string; delta?: number; goodWhenUp?: boolean; foot: string; tone?: "good" | "warn"; small?: boolean;
}) {
  return (
    <div className="grid min-w-0 content-start gap-1 rounded-[18px] border border-bq-line bg-white px-4 py-3.5">
      <span className="text-[12.5px] font-semibold text-bq-ink-3">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <b className={cn("num font-bold tracking-tight", small ? "text-[24px]" : "text-[30px]", tone === "warn" && "text-[#9a6400]")}>
          {value}{unit && <small className="ml-px text-[13px] font-semibold text-bq-ink-3">{unit}</small>}
        </b>
        {delta !== undefined && <Delta d={delta} goodWhenUp={goodWhenUp} />}
      </div>
      <span className="text-[12.5px] leading-snug text-bq-ink-2">{foot}</span>
    </div>
  );
}

/** Change since the previous cycle. Under STABLE points it reads "stabil". */
function Delta({ d, goodWhenUp = false }: { d: number | null; goodWhenUp?: boolean }) {
  if (d === null) return <span className="text-[12px] text-bq-ink-3">-</span>;
  if (Math.abs(d) < STABLE) return <span className="text-[12px] font-semibold text-bq-ink-3">stabil</span>;
  const good = goodWhenUp ? d > 0 : d < 0;
  return (
    <span className={cn("num text-[12.5px] font-bold whitespace-nowrap", good ? "text-[#2f7a4f]" : "text-[#b4361f]")}>
      {d > 0 ? "▲" : "▼"} {Math.abs(d)} poin
    </span>
  );
}

function Low({ v }: { v: number }) {
  return <span className={cn(v < 50 && "font-bold text-[#b4361f]")}>{v}</span>;
}

function Bar({ label, hint, value, unit = "", dark, prev }: { label: React.ReactNode; hint?: string; value: number; unit?: string; dark?: boolean; prev?: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,150px)_1fr_44px] items-center gap-3 sm:grid-cols-[190px_1fr_48px]" title={hint}>
      <span className="text-[13px] leading-snug font-medium">{label}</span>
      <div className="h-3 rounded-full bg-bq-mist">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: dark ? "#3e2a8f" : "#b9a2f8" }} />
      </div>
      <span className="num text-right text-[13px] font-bold">
        {value}{unit}
        {prev !== undefined && Math.abs(value - prev) >= STABLE && (
          <span className={cn("block text-[10.5px] font-semibold", value > prev ? "text-[#2f7a4f]" : "text-[#b4361f]")}>{value > prev ? "+" : ""}{value - prev}</span>
        )}
      </span>
    </div>
  );
}

function Advice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-bq-mist px-3.5 py-2.5 text-[13.5px] leading-relaxed text-bq-plum">{children}</p>;
}
