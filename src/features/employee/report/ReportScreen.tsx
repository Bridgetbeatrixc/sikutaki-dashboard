"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { fitRange, LineChart } from "@/components/charts/LineChart";
import { MOOD_COLORS } from "@/components/charts/MoodBar";
import { CountUp, GrowBar, Reveal, ScoreRing } from "@/components/motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { guideOf } from "@/lib/area-guide";
import { AREA_COUNT, AREAS, areaById, CAUSES, CORE, GROUPS, OTHER_CAUSE, wellbeingBand, wellbeingFrom } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { hours, listJoin } from "@/lib/format";
import { ROUTES } from "@/lib/paths";
import { AREA_SUGGESTION, practiceById, programById, programState } from "@/lib/practice";
import { addDays, DAYS_LONG, longDate, shortDate, weekStart } from "@/lib/week";
import { loadRequests, STATUS_LABEL as REQUEST_LABEL, type CounselRequest } from "@/store/counseling";
import { loadEmployeeLocal, type EmployeeLocal } from "@/store/employee";
import { AreaRow, ScoreKey } from "../components/AreaRow";
import { appButton, Chip } from "../components/ui";
import { MOODS, moodById } from "../content";
import { useEmployee } from "../EmployeeProvider";

const PERIODS = [30, 90] as const;
const MAX_SLEEP = 10;
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : null);
const toScores = (answers: Record<string, number>) => Object.fromEntries(Object.entries(answers).map(([a, v]) => [a, v * 25]));
const BAND_COLOR: Record<string, string> = { baik: "#1f9d68", waspada: "#e0a020", perhatian: "#d4583f" };

type Checkin = [week: string, c: EmployeeLocal["checkins"][string]];
type Latest = { area: string; v: number; week: string };

/**
 * The employee's own report: where they stand, all 42 areas explained, how findings relate, a personal plan,
 * progress over time and what comes next. Built from this account's data only; nothing here is sent to HR.
 */
export function ReportScreen() {
  const emp = useEmployee();
  const { user, company, today, teams } = emp;
  const [local, setLocal] = useState<EmployeeLocal | null>(null);
  const [requests, setRequests] = useState<CounselRequest[]>([]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(30);
  useEffect(() => { setLocal(loadEmployeeLocal()); setRequests(loadRequests()); }, []);
  if (!local) return null;

  const from = addDays(today, -(period - 1));
  const team = teams.find((t) => t.id === user.teamId)?.name;
  const days = local.days.filter((d) => d.day >= from && d.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  const all: Checkin[] = Object.entries(local.checkins).sort(([a], [b]) => a.localeCompare(b));
  const checkins = all.filter(([w]) => w >= addDays(from, -6));
  const doneDays = Object.entries(local.done).filter(([d]) => d >= from && d <= today);
  const finished = local.finished.filter((f) => f.finishedOn >= from);
  const mine = requests.filter((r) => r.createdAt.slice(0, 10) >= from);
  const practices = doneDays.reduce((s, [, ids]) => s + ids.length, 0);

  // Latest answer per area over the last 12 weeks: rotating areas come back every 8 weeks.
  const latest = new Map<string, Latest>();
  for (const [w, c] of all.filter(([w]) => w >= addDays(today, -84))) for (const [a, v] of Object.entries(c.answers)) if (areaById(a)) latest.set(a, { area: a, v, week: w });
  const last = checkins[checkins.length - 1];
  const index = last ? wellbeingFrom(toScores(last[1].answers)) : null;

  const ctx: Ctx = { days, checkins, latest, last, index, practices, doneDays, period, from, today };

  return (
    <div className="mx-auto w-full max-w-[960px] px-[22px] pt-4 pb-28 md:px-8 md:pb-12 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link href={ROUTES.employee.insight} className="mr-auto inline-flex items-center gap-1 text-[15.5px] font-semibold text-muted">
          <Icon name="chevron" size={14} className="rotate-180" />Insight
        </Link>
        {PERIODS.map((p) => <Chip key={p} on={period === p} onClick={() => setPeriod(p)}>{`${p} hari`}</Chip>)}
      </div>

      <Hero name={user.name} sub={`${company.name}${team ? ` · ${team}` : ""}`} ctx={ctx} checkinsCount={checkins.length} />
      <p className="mt-3 text-[15px] leading-normal text-body">
        Disusun dari catatan yang kamu isi sendiri. Hanya kamu yang melihatnya, kecuali kamu memilih membagikannya. Ini gambaran untuk memahami diri, bukan diagnosis.
      </p>
      <nav className="mt-3 flex flex-wrap gap-1.5 print:hidden" aria-label="Isi laporan">
        {SECTIONS.map((s, i) => <a key={s.id} href={`#${s.id}`} className="rounded-full bg-soft px-3 py-1.5 text-[14.5px] font-semibold text-app-dark hover:bg-mint">{i + 1}. {s.title}</a>)}
      </nav>

      <Summary ctx={ctx} />
      <Profile ctx={ctx} />
      <Links ctx={ctx} />
      <Plan ctx={ctx} />
      <Progress ctx={ctx} programs={local.programs} finished={finished} />
      <Next ctx={ctx} requests={mine} />
      <Conclusion ctx={ctx} />

      <Block id="bantuan" icon="heart" title="Bila butuh bantuan sekarang">
        <p className="text-[15.5px] leading-normal text-body">
          Healing119: telepon <b>119 ekstensi 8</b>, 24 jam. Keadaan darurat: <b>112</b>.
        </p>
      </Block>
      <p className="mt-4 text-[13.5px] text-muted">Dibuat {longDate(today)} dari aplikasi Sikutaki. Sikutaki bukan alat diagnosis dan bukan layanan krisis.</p>

      <div className="sticky bottom-24 mt-5 grid gap-2 md:static md:max-w-[360px] print:hidden">
        <button type="button" className={appButton("primary", true, "mt-0")} onClick={() => window.print()}>
          <span className="flex items-center justify-center gap-2"><Icon name="file" size={16} />Simpan sebagai PDF</span>
        </button>
        <small className="text-center text-[14px] text-muted">Di jendela cetak, pilih tujuan &ldquo;Simpan sebagai PDF&rdquo;.</small>
      </div>
    </div>
  );
}

type Ctx = {
  days: EmployeeLocal["days"]; checkins: Checkin[]; latest: Map<string, Latest>; last: Checkin | undefined;
  index: number | null; practices: number; doneDays: [string, string[]][]; period: number; from: string; today: string;
};

const SECTIONS = [
  { id: "ringkasan", title: "Ringkasan" },
  { id: "profil", title: "Profil 42 area" },
  { id: "hubungan", title: "Hubungan antartemuan" },
  { id: "rencana", title: "Rencana pribadi" },
  { id: "perkembangan", title: "Perkembangan" },
  { id: "berikutnya", title: "Langkah berikutnya" },
  { id: "kesimpulan", title: "Kesimpulan" },
];

function Block({ id, icon, title, sub, children }: { id: string; icon: IconName; title: string; sub?: string; children: ReactNode }) {
  const n = SECTIONS.findIndex((s) => s.id === id);
  return (
    <Reveal as="section" className="mt-7">
      <div id={id} className="flex scroll-mt-20 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint text-app"><Icon name={icon} size={18} /></span>
        <div>
          <h2 className="text-[19px] font-bold text-ink">{n >= 0 && <span className="text-app">{n + 1}. </span>}{title}</h2>
          {sub && <p className="text-[15px] text-muted">{sub}</p>}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </Reveal>
  );
}

function Empty({ children, href, cta }: { children: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-[#c9d6ea] bg-soft px-3.5 py-3 text-[15.5px] text-body">
      <span><b className="text-ink">Belum cukup data.</b> {children}</span>
      {href && cta && <Link href={href} className="w-fit rounded-full bg-app px-3 py-1.5 text-[15px] font-semibold text-white print:hidden">{cta}</Link>}
    </div>
  );
}

/* ---------- Header ---------- */

function Hero({ name, sub, ctx, checkinsCount }: { name: string; sub: string; ctx: Ctx; checkinsCount: number }) {
  const band = ctx.index === null ? null : wellbeingBand(ctx.index);
  return (
    <header className="relative mt-4 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0a4fc0,#0a66f5_55%,#3b8ef7)] px-5 py-5 text-white print:mt-0 print:rounded-xl md:px-7 md:py-6">
      <span className="pointer-events-none absolute -top-16 -right-10 size-56 animate-bob rounded-full bg-white/10 print:hidden" />
      <span className="pointer-events-none absolute -bottom-20 left-1/3 size-44 rounded-full bg-white/5" />
      <div className="relative flex flex-wrap items-center gap-5">
        <ScoreRing value={ctx.index} color="#ffffff" track="rgba(255,255,255,.22)" textClass="text-white" label="indeks pribadi" />
        <div className="min-w-[200px] flex-1">
          <small className="text-[14px] font-semibold tracking-wide uppercase opacity-85">Laporan pribadi · Sikutaki</small>
          <h1 className="mt-1 text-[26px] leading-tight font-bold text-white">{name}</h1>
          <p className="mt-0.5 text-[15.5px] opacity-90">{sub}</p>
          <p className="mt-2 text-[15.5px] opacity-90">{longDate(ctx.from)} sampai {longDate(ctx.today)} ({ctx.period} hari)</p>
          {band && <p className="mt-2 inline-block rounded-full bg-white/18 px-3 py-1 text-[15px] font-semibold backdrop-blur">{band.label}: {band.text}</p>}
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <HeroStat value={ctx.days.length} label={`dari ${ctx.period} hari tercatat`} />
        <HeroStat value={checkinsCount} label="check-in mingguan" />
        <HeroStat value={ctx.practices} label="latihan selesai" />
      </div>
    </header>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/14 px-3 py-2.5 backdrop-blur-sm">
      <b className="block text-[24px] leading-tight font-bold"><CountUp value={value} /></b>
      <small className="text-[14px] leading-tight opacity-85">{label}</small>
    </div>
  );
}

/* ---------- 1. Summary ---------- */

function Summary({ ctx }: { ctx: Ctx }) {
  const items = [...ctx.latest.values()];
  const attention = items.filter((x) => x.v >= 3).sort((a, b) => b.v - a.v || Number(CORE.includes(b.area)) - Number(CORE.includes(a.area)));
  const watch = items.filter((x) => x.v === 2);
  const good = items.filter((x) => x.v <= 1);
  const sleep = avg(ctx.days.map((d) => d.sleep)), mood = avg(ctx.days.map((d) => d.mood));
  return (
    <Block id="ringkasan" icon="spark" title="Ringkasan personal" sub="Kondisi yang menonjol, yang sudah baik, dan prioritasmu">
      {items.length === 0 ? <Empty href={ROUTES.employee.checkin} cta="Isi check-in">Isi check-in mingguan agar ringkasan bisa disusun.</Empty> : (
        <div className="grid gap-3 md:grid-cols-3 print:grid-cols-3">
          <SummaryCard tone="bad" title="Perlu perhatian" count={attention.length}
            text={attention.length ? `${listJoin(attention.slice(0, 3).map((x) => areaById(x.area).name))} sering kamu alami.` : "Tidak ada area yang sering kamu alami. Bagus."} />
          <SummaryCard tone="warn" title="Perlu dipantau" count={watch.length}
            text={watch.length ? `${listJoin(watch.slice(0, 3).map((x) => areaById(x.area).name))} kadang-kadang muncul.` : "Tidak ada area di tingkat kadang-kadang."} />
          <SummaryCard tone="good" title="Sudah baik" count={good.length}
            text={good.length ? `${good.length} area jarang atau tidak pernah kamu alami${sleep !== null && sleep >= 7 ? `, dan tidurmu rata-rata ${hours(sleep)}` : ""}.` : "Belum ada area di tingkat aman."} />
        </div>
      )}
      {(attention[0] || mood !== null) && (
        <p className="mt-3 rounded-2xl bg-[#fff7ec] px-3.5 py-3 text-[16px] leading-normal text-[#5b4520]">
          <b>Prioritasmu: </b>
          {attention[0] ? `${areaById(attention[0].area).name}. ${guideOf(attention[0].area).high}` : watch[0] ? `jaga ${areaById(watch[0].area).name} agar tidak naik.` : "pertahankan kebiasaan baikmu."}
          {mood !== null && ` Mood harianmu rata-rata ${moodById(Math.round(mood)).label.toLowerCase()}.`}
        </p>
      )}
    </Block>
  );
}

const TONE = { bad: { bg: "bg-bad-bg", fg: "text-[#a2341f]", bar: "#d4583f" }, warn: { bg: "bg-warn-bg", fg: "text-[#8a5300]", bar: "#e0a020" }, good: { bg: "bg-good-bg", fg: "text-good", bar: "#1f9d68" } };

function SummaryCard({ tone, title, count, text }: { tone: keyof typeof TONE; title: string; count: number; text: string }) {
  const t = TONE[tone];
  return (
    <div className={cn("grid content-start gap-1 rounded-2xl px-3.5 py-3", t.bg)}>
      <span className={cn("flex items-baseline justify-between text-[15.5px] font-bold", t.fg)}>{title}<b className="text-[28px] leading-none"><CountUp value={count} /></b></span>
      <span className="text-[15px] leading-snug text-body">{text}</span>
    </div>
  );
}

/* ---------- 2. Profile of 42 areas ---------- */

function Profile({ ctx }: { ctx: Ctx }) {
  const assessed = ctx.latest.size;
  return (
    <Block id="profil" icon="grid" title={`Profil ${AREA_COUNT} area`} sub={`${assessed} dari ${AREA_COUNT} area sudah dinilai. Area lain ditanyakan bergiliran setiap minggu.`}>
      <ScoreKey className="mb-3" />
      <div className="mb-3">
        <GrowBar pct={(assessed / AREA_COUNT) * 100} color="#0a66f5" className="h-2.5" />
        <small className="mt-1 block text-[14px] text-muted">{assessed} area dinilai, {AREA_COUNT - assessed} belum dinilai</small>
      </div>
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 print:grid-cols-2">
        {GROUPS.map((g, gi) => {
          const list = AREAS.filter((a) => a.group === g.id);
          const rated = list.flatMap((a) => (ctx.latest.has(a.id) ? [ctx.latest.get(a.id)!] : []));
          const score = rated.length ? Math.round(avg(rated.map((x) => x.v * 25))!) : null;
          const hi = rated.filter((x) => x.v >= 3).map((x) => areaById(x.area).name);
          return (
            <div key={g.id} className="grid gap-1.5 rounded-2xl border border-line bg-white px-3.5 py-3">
              <span className="flex items-center justify-between gap-2 text-[16px] font-bold" style={{ color: g.color }}>
                {g.name}<small className="text-[14px] font-medium text-muted">{rated.length}/{list.length} dinilai</small>
              </span>
              {score === null ? <small className="text-[14.5px] text-muted">Belum cukup data di kelompok ini.</small> : (
                <>
                  <GrowBar pct={score} color={g.color} delay={gi * 70} />
                  <small className="text-[14.5px] leading-snug text-body">
                    {hi.length ? <>Perlu perhatian: <b>{listJoin(hi)}</b>.</> : rated.some((x) => x.v === 2) ? "Ada yang kadang-kadang muncul, tidak ada yang sering." : "Semua yang dinilai jarang muncul."}
                  </small>
                </>
              )}
            </div>
          );
        })}
        <p className="text-[14px] text-muted sm:col-span-2">Panjang batang = seberapa sering keluhan di kelompok itu muncul. Makin panjang makin perlu perhatian. Penjelasan tiap area ada di bawah.</p>
      </div>
      <div className="grid gap-4">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <h3 className="mb-1.5 text-[16px] font-bold break-after-avoid" style={{ color: g.color }}>{g.name}</h3>
            <ul className="grid gap-1.5 sm:grid-cols-2 print:grid-cols-2">
              {AREAS.filter((a) => a.group === g.id).map((a) => {
                const x = ctx.latest.get(a.id);
                return <AreaRow key={a.id} area={a.id} answer={x?.v ?? null} date={x?.week} compact />;
              })}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  );
}

/* ---------- 3. How findings relate ---------- */

type Finding = { title: string; text: string; ask: string };

function findings(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const v = (a: string) => ctx.latest.get(a)?.v;
  const mood = avg(ctx.days.map((d) => d.mood)), sleep = avg(ctx.days.map((d) => d.sleep));
  const tired = ["burnout", "stres"].filter((a) => (v(a) ?? 0) >= 3);
  if (mood !== null && mood >= 3.5 && tired.length) out.push({
    title: "Mood baik, tapi lelah tetap tinggi",
    text: `Mood harianmu cenderung baik, sementara ${listJoin(tired.map((a) => areaById(a).name))} sering kamu alami. Bisa jadi kamu tetap bersemangat walau tenagamu terkuras, atau mood dicatat di waktu yang lebih ringan. Belum tentu ada satu penyebab.`,
    ask: "Mood harianku baik, tapi hasil kelelahanku tinggi. Kenapa bisa begitu?",
  });
  if ((v("insomnia") ?? 0) >= 3 && sleep !== null && sleep >= 7) out.push({
    title: "Jam tidur cukup, tapi tidur terasa kurang",
    text: `Rata-rata kamu tidur ${hours(sleep)}, tapi sering sulit tidur atau bangun tidak segar. Yang perlu diperhatikan mungkin kualitas tidurnya, bukan lamanya.`,
    ask: "Jam tidurku cukup tapi aku sering bangun tidak segar. Apa yang bisa kucoba?",
  });
  if ((v("insomnia") ?? 4) <= 1 && sleep !== null && sleep < 6) out.push({
    title: "Merasa tidur baik, tapi jamnya pendek",
    text: `Kamu jarang merasa sulit tidur, tapi rata-rata tidurmu hanya ${hours(sleep)}. Tubuh bisa terbiasa kurang tidur tanpa terasa.`,
    ask: "Aku jarang susah tidur tapi jam tidurku pendek. Apakah itu masalah?",
  });
  if ((v("baterai") ?? 0) >= 3 && (v("sosial") ?? 4) <= 1) out.push({
    title: "Nyaman bersosialisasi, tapi cepat lelah setelahnya",
    text: "Kamu tidak takut berinteraksi, tapi energimu cepat habis setelahnya. Ini berbeda dari kecemasan sosial: yang perlu diatur adalah waktu pemulihan.",
    ask: "Aku tidak takut bersosialisasi tapi cepat capek setelahnya. Bagaimana mengaturnya?",
  });
  const good = ctx.days.filter((d) => d.mood >= 4), low = ctx.days.filter((d) => d.mood <= 2);
  const gs = avg(good.map((d) => d.sleep)), ls = avg(low.map((d) => d.sleep));
  if (gs !== null && ls !== null && gs - ls >= 0.5) out.push({
    title: "Tidur tampak berkaitan dengan mood",
    text: `Di hari mood-mu baik, kamu tidur rata-rata ${hours(gs)}; di hari yang berat, ${hours(ls)}. Ini pola, belum tentu sebab-akibat.`,
    ask: "Sepertinya mood-ku ikut tidurku. Bagaimana memperbaikinya?",
  });
  if (ctx.last?.[1].causes.includes(OTHER_CAUSE) && ctx.last[1].note) out.push({
    title: "Pemicu yang kamu tulis sendiri",
    text: `Kamu menulis: “${ctx.last[1].note}”. Hal seperti ini sering tidak muncul di pilihan jawaban, tapi penting untuk memahami hasilmu.`,
    ask: `Di check-in aku menulis pemicunya: ${ctx.last[1].note}. Bisa bantu aku memikirkannya?`,
  });
  return out.slice(0, 4);
}

function Links({ ctx }: { ctx: Ctx }) {
  const list = findings(ctx);
  return (
    <Block id="hubungan" icon="trend" title="Hubungan antartemuan" sub="Hasil yang saling berkaitan atau tampak bertentangan. Ini dugaan, bukan kesimpulan.">
      {list.length === 0 ? (
        <p className="rounded-2xl bg-soft px-3.5 py-3 text-[15.5px] text-body">Belum ada hasil yang tampak bertentangan. Makin rutin kamu mencatat mood, tidur, dan check-in, makin banyak pola yang bisa terlihat.</p>
      ) : (
        <ul className="grid gap-2.5 md:grid-cols-2 print:grid-cols-2">
          {list.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 80} className="grid content-start gap-1.5 rounded-2xl border border-line bg-white px-3.5 py-3">
              <b className="text-[16px] text-ink">{f.title}</b>
              <span className="text-[15px] leading-normal text-body">{f.text}</span>
              <Link href={ROUTES.employee.ask(f.ask)} className="mt-0.5 inline-flex w-fit items-center gap-1 text-[15px] font-semibold text-app print:hidden"><Icon name="chat" size={14} />Tanya Asisten</Link>
            </Reveal>
          ))}
        </ul>
      )}
    </Block>
  );
}

/* ---------- 4. Personal plan ---------- */

function Plan({ ctx }: { ctx: Ctx }) {
  const { programs } = useEmployee();
  const top = [...ctx.latest.values()].filter((x) => x.v >= 2).sort((a, b) => b.v - a.v || Number(CORE.includes(b.area)) - Number(CORE.includes(a.area))).slice(0, 3);
  return (
    <Block id="rencana" icon="flag" title="Rencana pribadi" sub="Dua sampai tiga langkah yang paling relevan untukmu, dan alasannya">
      {top.length === 0 ? (
        <p className="rounded-2xl bg-good-bg px-3.5 py-3 text-[15.5px] text-body">Tidak ada area yang perlu ditangani sekarang. Pertahankan kebiasaan baik: catat mood harian dan isi check-in setiap minggu. Latihan singkat tetap bisa kamu pakai kapan saja.</p>
      ) : (
        <ol className="grid gap-2.5">
          {top.map((x, i) => {
            const g = guideOf(x.area);
            const p = practiceById(g.practice);
            const prog = AREA_SUGGESTION[x.area]?.program ? programById(AREA_SUGGESTION[x.area].program!) : undefined;
            const running = prog && programs.some((e) => e.program === prog.id);
            const name = areaById(x.area).name;
            return (
              <Reveal as="li" key={x.area} delay={i * 90} className="grid grid-cols-[32px_1fr] gap-3 rounded-2xl bg-soft px-3.5 py-3">
                <span className="grid size-8 place-items-center rounded-full bg-app text-[16.5px] font-bold text-white">{i + 1}</span>
                <div className="grid gap-1.5 text-[15.5px] leading-normal text-body">
                  <b className="text-[16.5px] text-ink">{name}</b>
                  <span><b>Alasan:</b> kamu menjawab &ldquo;{x.v >= 4 ? "Hampir selalu" : x.v === 3 ? "Sering" : "Kadang-kadang"}&rdquo; di check-in minggu {shortDate(x.week)}.</span>
                  <span><b>Langkah:</b> {g.tip}</span>
                  <div className="flex flex-wrap gap-2 print:hidden">
                    {p && <Link href={ROUTES.employee.exercise(p.id)} className="rounded-full bg-app px-3 py-1.5 text-[15px] font-semibold text-white">Mulai {p.title}</Link>}
                    {prog && <Link href={ROUTES.employee.program(prog.id)} className="rounded-full bg-white px-3 py-1.5 text-[15px] font-semibold text-app-dark">{running ? "Lanjutkan" : "Lihat"} program {prog.title}</Link>}
                    <Link href={ROUTES.employee.ask(`Bantu aku membuat rencana untuk ${name}`)} className="rounded-full bg-white px-3 py-1.5 text-[15px] font-semibold text-app-dark">Bahas dengan Asisten</Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      )}
    </Block>
  );
}

/* ---------- 5. Progress ---------- */

function Progress({ ctx, programs, finished }: { ctx: Ctx; programs: EmployeeLocal["programs"]; finished: EmployeeLocal["finished"] }) {
  const { today } = ctx;
  const weeks = ctx.checkins.slice(-12);
  const labels = weeks.map(([w]) => shortDate(w));
  const index = weeks.map(([, c]) => wellbeingFrom(toScores(c.answers)));
  const coreSeries = CORE.map((a, i) => ({ name: areaById(a).name, color: ["#C2418F", "#C27510", "#2F6BD8"][i], values: weeks.map(([, c]) => (c.answers[a] === undefined ? null : c.answers[a] * 25)) }));
  const first = weeks[0], lastW = weeks[weeks.length - 1];

  // Practices per check-in week, and the index in weeks with and without regular practice.
  const perWeek = weeks.map(([w]) => ctx.doneDays.filter(([d]) => d >= w && d < addDays(w, 7)).reduce((s, [, ids]) => s + ids.length, 0));
  const active = index.filter((v, i) => v !== null && perWeek[i] >= 3) as number[];
  const quiet = index.filter((v, i) => v !== null && perWeek[i] < 3) as number[];
  const counts = new Map<string, number>();
  for (const [, ids] of ctx.doneDays) for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTop = Math.max(1, ...top.map(([, n]) => n));

  return (
    <Block id="perkembangan" icon="bars" title="Perkembangan" sub="Perubahan dari check-in sebelumnya, latihan yang kamu jalankan, dan polanya">
      <div className="grid gap-3 lg:grid-cols-2 print:grid-cols-2">
        <Panel title="Indeks pribadi per check-in" sub="0 sampai 100, makin tinggi makin baik">
          {weeks.length < 2 ? <Empty href={ROUTES.employee.checkin} cta="Isi check-in">Tren muncul setelah minimal 2 check-in.</Empty> : (
            <>
              <LineChart series={[{ name: "Indeks pribadi", color: "#0A66F5", values: index }]} labels={labels} {...fitRange(index)} height={170} />
              {first && lastW && index[0] !== null && index[index.length - 1] !== null && (
                <p className="mt-1 text-[15px] text-body">
                  Dari {shortDate(first[0])} ke {shortDate(lastW[0])}: {deltaText(index[index.length - 1]! - index[0]!, true)}.
                </p>
              )}
            </>
          )}
        </Panel>
        <Panel title="Stres, burnout, dan tidur" sub="Ditanyakan setiap minggu. Makin tinggi makin sering dialami.">
          {weeks.length < 2 ? <Empty>Tren muncul setelah minimal 2 check-in.</Empty> : (
            <>
              <LineChart series={coreSeries} labels={labels} min={0} max={100} height={170} band={{ from: 62, to: 100 }} />
              <ul className="mt-1 grid gap-0.5 text-[15px] text-body">
                {CORE.map((a) => {
                  const f = first[1].answers[a], l = lastW[1].answers[a];
                  return f === undefined || l === undefined ? null : <li key={a}>{areaById(a).name}: {deltaText((l - f) * 25, false)}</li>;
                })}
              </ul>
            </>
          )}
        </Panel>
        <Panel title="Latihan yang kamu jalankan" sub={`${ctx.practices} latihan dalam ${ctx.period} hari`}>
          {top.length === 0 ? <Empty href={ROUTES.employee.exercises} cta="Lihat latihan">Belum ada latihan tercatat di periode ini.</Empty> : (
            <ul className="grid gap-2">
              {top.map(([id, n], i) => (
                <li key={id} className="grid gap-1 text-[15px]">
                  <span className="flex justify-between"><span>{practiceById(id)?.title ?? id}</span><b className="num">{n}×</b></span>
                  <GrowBar pct={(n / maxTop) * 100} color="#3B8EF7" delay={i * 80} />
                </li>
              ))}
            </ul>
          )}
          {active.length > 0 && quiet.length > 0 && (
            <p className="mt-2 rounded-xl bg-soft px-3 py-2 text-[15px] text-body">
              Di minggu dengan 3 latihan atau lebih, indeksmu rata-rata <b>{Math.round(avg(active)!)}</b>; di minggu lain <b>{Math.round(avg(quiet)!)}</b>. {avg(active)! > avg(quiet)! ? "Latihan tampaknya ikut membantu." : "Belum terlihat bedanya; coba terus beberapa minggu lagi."}
            </p>
          )}
        </Panel>
        <Panel title="Program" sub="Kemajuan program yang berjalan dan yang sudah selesai">
          {programs.length === 0 && finished.length === 0 ? <Empty href={ROUTES.employee.exercises} cta="Pilih program">Belum ada program di periode ini.</Empty> : (
            <ul className="grid gap-2.5">
              {programs.map((e) => {
                const st = programState(e, today, null);
                return (
                  <li key={e.id} className="grid gap-1 text-[15px]">
                    <span className="flex justify-between gap-2"><span>{st.program.title}{e.paused && " (dijeda)"}</span><b className="num">{Math.min(st.daysDone, st.program.days)}/{st.program.days} hari</b></span>
                    <GrowBar pct={(st.daysDone / st.program.days) * 100} color="#1f9d68" />
                  </li>
                );
              })}
              {finished.map((f) => (
                <li key={`${f.program}-${f.finishedOn}`} className="flex justify-between gap-2 rounded-xl bg-good-bg px-3 py-2 text-[15px] text-good">
                  <span>{programById(f.program)?.title ?? f.program} selesai</span><span>{shortDate(f.startedOn)} sampai {shortDate(f.finishedOn)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <MoodSleep days={ctx.days} from={ctx.from} period={ctx.period} />
    </Block>
  );
}

function deltaText(d: number, goodWhenUp: boolean) {
  const r = Math.round(d);
  if (Math.abs(r) < 5) return `relatif stabil (${r > 0 ? "+" : ""}${r} poin)`;
  const better = goodWhenUp ? r > 0 : r < 0;
  return `${better ? "membaik" : "memburuk"} ${Math.abs(r)} poin${Math.abs(r) >= 10 ? ", perubahan yang cukup berarti" : ""}`;
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 content-start gap-2 rounded-2xl border border-line bg-white px-3.5 py-3">
      <div><b className="text-[16px] text-ink">{title}</b>{sub && <small className="block text-[14px] text-muted">{sub}</small>}</div>
      {children}
    </div>
  );
}

function MoodSleep({ days, from, period }: { days: EmployeeLocal["days"]; from: string; period: number }) {
  const slots = Array.from({ length: period }, (_, i) => addDays(from, i));
  const count = MOODS.map((m) => days.filter((d) => d.mood === m.id).length);
  return (
    <div className="mt-3">
      <Panel title="Tidur dan mood harian" sub="Tinggi batang = jam tidur, warna = mood hari itu. Kosong = tidak ada catatan.">
        {days.length === 0 ? <Empty href={ROUTES.employee.home} cta="Catat hari ini">Catat mood dan tidur dari Beranda, 10 detik sehari.</Empty> : (
          <>
            <div className="flex h-[120px] items-end gap-[2px] rounded-xl bg-soft px-2 pt-2 pb-1" role="img" aria-label={`${days.length} hari tercatat dari ${period} hari`}>
              {slots.map((s, i) => {
                const d = days.find((x) => x.day === s);
                return (
                  <div key={s} className="flex h-full flex-1 items-end" title={d ? `${shortDate(s)}: tidur ${hours(d.sleep)}, ${moodById(d.mood).label}` : shortDate(s)}>
                    <div className="w-full origin-bottom animate-[rise_.6s_ease-out_both] rounded-t-[3px] print:animate-none" style={d ? { height: `${Math.min(1, d.sleep / MAX_SLEEP) * 100}%`, background: MOOD_COLORS[d.mood - 1], animationDelay: `${i * 12}ms` } : { height: 3, background: "#dfe3ea" }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[13.5px] text-muted"><span>{shortDate(from)}</span><span>{shortDate(slots[slots.length - 1])}</span></div>
            <ul className="grid grid-cols-5 gap-1.5">
              {MOODS.map((m, i) => (
                <li key={m.id} className="rounded-xl bg-soft px-2 py-2 text-center">
                  <i className="mx-auto mb-1 block size-2.5 rounded-full" style={{ background: MOOD_COLORS[i] }} />
                  <b className="num block text-[17.5px]"><CountUp value={count[i]} /></b>
                  <small className="block text-[13px] leading-tight text-muted">{m.label}</small>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ---------- 6. Next steps ---------- */

function Next({ ctx, requests }: { ctx: Ctx; requests: CounselRequest[] }) {
  const { week } = useEmployee();
  const nextCheckin = week.answers ? addDays(addDays(weekStart(ctx.today), 7), week.opensOn - 1) : null;
  const options: { icon: IconName; title: string; text: string; href: string }[] = [
    { icon: "spark", title: "Ngobrol dengan Asisten", text: "Pahami hasilmu, cari pemicunya, dan pilih latihan.", href: ROUTES.employee.assistant },
    { icon: "lotus", title: "Latihan mandiri", text: "Napas, relaksasi, gerak ringan, dan menulis, 1 sampai 10 menit.", href: ROUTES.employee.exercises },
    { icon: "heart", title: "Tenangkan diri", text: "Untuk saat cemas atau panik datang tiba-tiba.", href: ROUTES.employee.calm },
    { icon: "chat", title: "Psikolog mitra", text: "Bila suatu saat kamu ingin bicara dengan profesional.", href: ROUTES.employee.counseling },
  ];
  return (
    <Block id="berikutnya" icon="calendar" title="Langkah berikutnya" sub="Jadwal check-in dan dukungan yang bisa kamu pilih">
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#eef5ff] px-3.5 py-3 text-[15.5px] text-body">
        <Icon name="calendar" size={20} className="shrink-0 text-app" />
        <span>{nextCheckin ? <>Check-in berikutnya dibuka <b>{DAYS_LONG[new Date(`${nextCheckin}T00:00:00Z`).getUTCDay()]}, {shortDate(nextCheckin)}</b>. Hasilnya akan menunjukkan apakah langkah di atas membantu.</>
          : week.open ? <>Check-in minggu ini <b>sudah dibuka</b> dan ditutup Minggu 23.59.</> : <>Check-in minggu ini dibuka <b>{DAYS_LONG[week.opensOn]}</b>.</>}</span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 print:grid-cols-2">
        {options.map((o) => (
          <li key={o.title}>
            <Link href={o.href} className="grid grid-cols-[36px_1fr] items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 hover:border-app/40">
              <span className="grid size-9 place-items-center rounded-xl bg-mint text-app"><Icon name={o.icon} size={17} /></span>
              <span><b className="block text-[15.5px] text-ink">{o.title}</b><small className="text-[14px] leading-tight text-muted">{o.text}</small></span>
            </Link>
          </li>
        ))}
      </ul>
      {requests.length > 0 && (
        <ul className="mt-3 grid gap-1.5">
          {requests.map((r) => (
            <li key={r.id} className="flex justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-[15px]">
              <span>Jadwal konseling diajukan {shortDate(r.createdAt.slice(0, 10))} · {r.mode}</span>
              <b>{r.schedule && r.status === "dijadwalkan" ? `${shortDate(r.schedule.date)}, ${r.schedule.time}` : REQUEST_LABEL[r.status]}</b>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}

/* ---------- 7. Conclusion ---------- */

function Conclusion({ ctx }: { ctx: Ctx }) {
  const items = [...ctx.latest.values()];
  const attention = items.filter((x) => x.v >= 3).map((x) => areaById(x.area).name);
  const band = ctx.index === null ? null : wellbeingBand(ctx.index);
  const weeks = ctx.checkins.map(([, c]) => wellbeingFrom(toScores(c.answers))).filter((v): v is number => v !== null);
  const trend = weeks.length >= 2 ? weeks[weeks.length - 1] - weeks[0] : null;
  const causes = (ctx.last?.[1].causes ?? []).filter((c) => c !== OTHER_CAUSE).map((c) => CAUSES[c]?.label.toLowerCase()).filter(Boolean);
  const parts: string[] = [];
  if (band && ctx.index !== null) parts.push(`Indeks pribadimu saat ini ${ctx.index} dari 100 (${band.label.toLowerCase()}).`);
  else parts.push("Belum cukup data untuk menghitung indeks pribadimu; isi check-in mingguan untuk memulainya.");
  if (trend !== null) parts.push(Math.abs(trend) < 5 ? "Selama periode ini kondisimu relatif stabil." : trend > 0 ? `Selama periode ini kondisimu membaik ${Math.round(trend)} poin.` : `Selama periode ini kondisimu turun ${Math.round(-trend)} poin, jadi perlu lebih dijaga.`);
  if (attention.length) parts.push(`Yang paling perlu perhatian: ${listJoin(attention.slice(0, 3))}${causes.length ? `, dengan pemicu yang kamu pilih ${listJoin(causes.slice(0, 2))}` : ""}.`);
  else if (items.length) parts.push("Tidak ada area yang sering kamu alami.");
  parts.push(ctx.practices ? `Kamu sudah menyelesaikan ${ctx.practices} latihan. Lanjutkan rencana pribadi di atas dan lihat perubahannya di check-in berikutnya.` : "Mulai dari satu latihan singkat di rencana pribadi, lalu lihat perubahannya di check-in berikutnya.");
  return (
    <Block id="kesimpulan" icon="check" title="Kesimpulan">
      <div className="rounded-2xl bg-[linear-gradient(135deg,#eef5ff,#f4fbf7)] px-4 py-3.5 text-[16px] leading-relaxed text-body">
        {parts.join(" ")}
        {band && <div className="mt-2 flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ background: BAND_COLOR[band.status] }} /><small className="text-[14.5px] text-muted">Indeks 0 sampai 100: 80 ke atas sangat baik, 65 sampai 79 baik, 50 sampai 64 cukup, di bawah 50 perlu perhatian.</small></div>}
      </div>
    </Block>
  );
}
