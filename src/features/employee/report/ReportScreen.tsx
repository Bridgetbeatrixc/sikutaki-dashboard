"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MOOD_COLORS } from "@/components/charts/MoodBar";
import { Icon } from "@/components/ui/Icon";
import { areaById, CORE } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { hours } from "@/lib/format";
import { ROUTES } from "@/lib/paths";
import { practiceById, programById } from "@/lib/practice";
import { addDays, longDate, shortDate } from "@/lib/week";
import { loadRequests, STATUS_LABEL as REQUEST_LABEL, type CounselRequest } from "@/store/counseling";
import { loadEmployeeLocal, type EmployeeLocal } from "@/store/employee";
import { appButton, Chip } from "../components/ui";
import { level, MOODS, moodById, type Level } from "../content";
import { useEmployee } from "../EmployeeProvider";

const PERIODS = [30, 90] as const;
const MAX_SLEEP = 10;
const LEVEL_CLASS: Record<Level, string> = { lo: "bg-mint text-app-dark", mid: "bg-warn-bg text-[#8a5300]", hi: "bg-bad-bg text-[#a2341f]" };
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : null);

/**
 * The employee's own report over the last 30 or 90 days, laid out to print or save as PDF.
 * Everything comes from this browser; nothing here is sent to HR.
 */
export function ReportScreen() {
  const { user, company, today, teams } = useEmployee();
  const [local, setLocal] = useState<EmployeeLocal | null>(null);
  const [requests, setRequests] = useState<CounselRequest[]>([]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(30);
  useEffect(() => { setLocal(loadEmployeeLocal()); setRequests(loadRequests()); }, []);
  if (!local) return null;

  const from = addDays(today, -(period - 1));
  const team = teams.find((t) => t.id === user.teamId)?.name;
  const days = local.days.filter((d) => d.day >= from && d.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  const checkins = Object.entries(local.checkins).filter(([w]) => w >= addDays(from, -6)).sort(([a], [b]) => a.localeCompare(b));
  const doneDays = Object.entries(local.done).filter(([d]) => d >= from && d <= today);
  const finished = local.finished.filter((f) => f.finishedOn >= from);
  const mine = requests.filter((r) => r.createdAt.slice(0, 10) >= from);

  return (
    <div className="px-[22px] pt-4 pb-28 md:px-8 md:pb-10 print:p-0">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link href={ROUTES.employee.insight} className="mr-auto inline-flex items-center gap-1 text-[13px] font-semibold text-muted">
          <Icon name="chevron" size={14} className="rotate-180" />Insight
        </Link>
        {PERIODS.map((p) => <Chip key={p} on={period === p} onClick={() => setPeriod(p)}>{`${p} hari`}</Chip>)}
      </div>

      <header className="mt-4 rounded-[22px] bg-[linear-gradient(135deg,#0a5bd8,#3b8ef7)] px-5 py-5 text-white print:mt-0 print:rounded-xl">
        <small className="text-xs font-semibold tracking-wide uppercase opacity-85">Laporan pribadi · Sikutaki</small>
        <h1 className="mt-1 text-[24px] font-bold leading-tight text-white">{user.name}</h1>
        <p className="mt-1 text-[13px] opacity-90">{company.name}{team ? ` · ${team}` : ""}</p>
        <p className="mt-3 text-[13px] opacity-90">Periode {longDate(from)} sampai {longDate(today)} ({period} hari)</p>
      </header>
      <p className="mt-3 text-[12.5px] leading-normal text-body">
        Laporan ini disusun dari catatan yang kamu isi sendiri di perangkat ini. Hanya kamu yang melihatnya, kecuali kamu memilih membagikannya, misalnya ke psikolog. Ini bukan diagnosis.
      </p>

      <Summary days={days} checkins={checkins.length} practices={doneDays.reduce((s, [, ids]) => s + ids.length, 0)} period={period} />
      <MoodSleep days={days} from={from} period={period} />
      <Checkins checkins={checkins} />
      <Practices doneDays={doneDays} programs={local.programs} finished={finished} today={today} />
      {mine.length > 0 && <Counseling requests={mine} />}

      <Block title="Bila butuh bantuan sekarang">
        <p className="text-[13px] leading-normal text-body">
          Healing119: telepon <b>119 ekstensi 8</b>, 24 jam. Keadaan darurat: <b>112</b>. Psikolog mitra perusahaan bisa dihubungi dari menu Konseling di Sikutaki.
        </p>
      </Block>
      <p className="mt-4 text-[11px] text-muted">Dibuat {longDate(today)} dari aplikasi Sikutaki. Sikutaki bukan alat diagnosis dan bukan layanan krisis.</p>

      <div className="sticky bottom-24 mt-5 grid gap-2 md:bottom-4 print:hidden">
        <button type="button" className={appButton("primary", true, "mt-0")} onClick={() => window.print()}>
          <span className="flex items-center justify-center gap-2"><Icon name="file" size={16} />Simpan sebagai PDF</span>
        </button>
        <small className="text-center text-[11.5px] text-muted">Di jendela cetak, pilih tujuan &ldquo;Simpan sebagai PDF&rdquo;.</small>
      </div>
    </div>
  );
}

function Block({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[16px] font-bold text-ink break-after-avoid">{title}</h2>
      {sub && <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-soft px-3 py-3">
      <b className="num block text-[20px] text-ink">{value}</b>
      <small className="text-[11.5px] leading-tight text-muted">{label}</small>
    </div>
  );
}

function Summary({ days, checkins, practices, period }: { days: EmployeeLocal["days"]; checkins: number; practices: number; period: number }) {
  const sleep = avg(days.map((d) => d.sleep));
  const mood = avg(days.map((d) => d.mood));
  return (
    <Block title="Ringkasan">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 print:grid-cols-4">
        <Stat value={`${days.length}/${period}`} label="hari tercatat" />
        <Stat value={sleep === null ? "-" : hours(sleep)} label="rata-rata tidur" />
        <Stat value={mood === null ? "-" : moodById(Math.round(mood)).label} label="mood rata-rata" />
        <Stat value={`${practices}`} label={`latihan selesai · ${checkins} check-in`} />
      </div>
    </Block>
  );
}

function MoodSleep({ days, from, period }: { days: EmployeeLocal["days"]; from: string; period: number }) {
  const slots = Array.from({ length: period }, (_, i) => addDays(from, i));
  const count = MOODS.map((m) => days.filter((d) => d.mood === m.id).length);
  const good = days.filter((d) => d.mood >= 4);
  const low = days.filter((d) => d.mood <= 2);
  const gs = avg(good.map((d) => d.sleep));
  const ls = avg(low.map((d) => d.sleep));
  return (
    <Block title="Tidur dan mood" sub="Tinggi batang = jam tidur, warna = mood hari itu. Kosong = tidak ada catatan.">
      {days.length === 0 ? (
        <p className="rounded-2xl bg-soft px-3.5 py-3 text-[13px] text-body">Belum ada catatan harian di periode ini. Catat mood dan tidur dari Beranda, 10 detik sehari.</p>
      ) : (
        <>
          <div className="flex h-[120px] items-end gap-[2px] rounded-2xl bg-soft px-2 pt-2 pb-1" role="img"
            aria-label={`${days.length} hari tercatat dari ${period} hari`}>
            {slots.map((s) => {
              const d = days.find((x) => x.day === s);
              return (
                <div key={s} className="flex h-full flex-1 items-end" title={d ? `${shortDate(s)}: tidur ${hours(d.sleep)}, ${moodById(d.mood).label}` : shortDate(s)}>
                  <div className="w-full rounded-t-[3px]" style={d ? { height: `${Math.min(1, d.sleep / MAX_SLEEP) * 100}%`, background: MOOD_COLORS[d.mood - 1] } : { height: 3, background: "#dfe3ea" }} />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted"><span>{shortDate(from)}</span><span>{shortDate(slots[slots.length - 1])}</span></div>
          <ul className="mt-3 grid grid-cols-5 gap-1.5">
            {MOODS.map((m, i) => (
              <li key={m.id} className="rounded-xl bg-soft px-2 py-2 text-center">
                <i className="mx-auto mb-1 block size-2.5 rounded-full" style={{ background: MOOD_COLORS[i] }} />
                <b className="num block text-[15px]">{count[i]}</b>
                <small className="block text-[10.5px] leading-tight text-muted">{m.label}</small>
              </li>
            ))}
          </ul>
          {gs !== null && ls !== null && (
            <p className="mt-3 text-[13px] leading-normal text-body">
              Di hari mood-mu baik, kamu tidur rata-rata <b>{hours(gs)}</b>. Di hari yang berat, <b>{hours(ls)}</b>
              {gs - ls >= 0.5 ? ". Tidur tampaknya ikut memengaruhi harimu." : "."}
            </p>
          )}
        </>
      )}
    </Block>
  );
}

function Checkins({ checkins }: { checkins: [string, EmployeeLocal["checkins"][string]][] }) {
  const last = checkins[checkins.length - 1];
  return (
    <Block title="Check-in mingguan" sub="Stres, burnout, dan tidur ditanyakan setiap minggu. Area lain bergantian.">
      {!last ? (
        <p className="rounded-2xl bg-soft px-3.5 py-3 text-[13px] text-body">Belum ada check-in di periode ini.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 text-[12.5px]">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 pr-2 font-semibold">Minggu</th>
                  {CORE.map((a) => <th key={a} className="py-1 pr-2 font-semibold">{areaById(a).name}</th>)}
                </tr>
              </thead>
              <tbody>
                {checkins.slice(-8).map(([w, c]) => (
                  <tr key={w}>
                    <td className="py-1 pr-2 whitespace-nowrap text-body">{shortDate(w)}</td>
                    {CORE.map((a) => {
                      const v = c.answers[a];
                      if (v === undefined) return <td key={a} className="text-muted">-</td>;
                      const l = level(v);
                      return <td key={a} className="pr-2"><span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-bold", LEVEL_CLASS[l.tone])}>{l.label}</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-3 text-[13.5px] font-semibold">Semua area di check-in terakhir ({shortDate(last[0])})</h3>
          <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2 print:grid-cols-2">
            {Object.keys(last[1].answers).filter((a) => areaById(a)).map((a) => {
              const l = level(last[1].answers[a]);
              return (
                <li key={a} className="flex items-center justify-between rounded-xl bg-soft px-3 py-2 text-[12.5px]">
                  <span>{areaById(a).name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", LEVEL_CLASS[l.tone])}>{l.label}</span>
                </li>
              );
            })}
          </ul>
          {last[1].causes.length > 0 && <p className="mt-2 text-[12.5px] text-body">Yang kamu sebut sebagai pemicu: {last[1].causes.join(", ")}.</p>}
          <p className="mt-2 text-[11.5px] text-muted">Gambaran dari jawabanmu sendiri, bukan diagnosis.</p>
        </>
      )}
    </Block>
  );
}

function Practices({ doneDays, programs, finished, today }: {
  doneDays: [string, string[]][]; programs: EmployeeLocal["programs"]; finished: EmployeeLocal["finished"]; today: string;
}) {
  const counts = new Map<string, number>();
  for (const [, ids] of doneDays) for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const activeDays = doneDays.filter(([, ids]) => ids.length > 0).length;
  return (
    <Block title="Latihan dan program">
      {top.length === 0 && programs.length === 0 && finished.length === 0 ? (
        <p className="rounded-2xl bg-soft px-3.5 py-3 text-[13px] text-body">Belum ada latihan tercatat di periode ini.</p>
      ) : (
        <div className="grid gap-3">
          {top.length > 0 && (
            <div>
              <p className="text-[13px] text-body">Kamu berlatih di <b>{activeDays} hari</b>. Yang paling sering:</p>
              <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2 print:grid-cols-2">
                {top.map(([id, n]) => (
                  <li key={id} className="flex justify-between rounded-xl bg-soft px-3 py-2 text-[12.5px]">
                    <span>{practiceById(id)?.title ?? id}</span><b className="num">{n}×</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {programs.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-semibold">Program berjalan</h3>
              <ul className="mt-1.5 grid gap-1.5">
                {programs.map((e) => {
                  const p = programById(e.program);
                  const daysDone = new Set(e.sessions.map((s) => s.day)).size;
                  return (
                    <li key={e.id} className="flex justify-between rounded-xl bg-soft px-3 py-2 text-[12.5px]">
                      <span>{p?.title ?? e.program}{e.paused && " (dijeda)"} · mulai {shortDate(e.startedOn)}</span>
                      <b>{Math.min(daysDone, p?.days ?? daysDone)}/{p?.days ?? "?"} hari</b>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {finished.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-semibold">Program selesai</h3>
              <ul className="mt-1.5 grid gap-1.5">
                {finished.map((f) => (
                  <li key={`${f.program}-${f.finishedOn}`} className="flex justify-between rounded-xl bg-mint px-3 py-2 text-[12.5px] text-app-dark">
                    <span>{programById(f.program)?.title ?? f.program}</span>
                    <span>{shortDate(f.startedOn)} sampai {f.finishedOn === today ? "hari ini" : shortDate(f.finishedOn)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Block>
  );
}

function Counseling({ requests }: { requests: CounselRequest[] }) {
  return (
    <Block title="Jadwal konseling" sub="Hanya status jadwal. Isi sesi tidak tercatat di Sikutaki.">
      <ul className="grid gap-1.5">
        {requests.map((r) => (
          <li key={r.id} className="flex justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-[12.5px]">
            <span>Diajukan {shortDate(r.createdAt.slice(0, 10))} · {r.mode}</span>
            <b>{r.schedule && r.status === "dijadwalkan" ? `${shortDate(r.schedule.date)}, ${r.schedule.time}` : REQUEST_LABEL[r.status]}</b>
          </li>
        ))}
      </ul>
    </Block>
  );
}
