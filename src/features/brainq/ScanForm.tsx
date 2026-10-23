"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { CONCERNS, DEMAND, QUESTION_IDS, RED_FLAGS, ROLES, SECTIONS, type Question } from "./questions";

type Company = { name: string; teams: { id: string; name: string }[] } | null;
type Result = {
  score: number; headline: string;
  brain6: { key: string; name: string; score: number }[];
  fog: { level: string; meaning: string };
  bottleneck: { title: string; why: string };
  nextMove: { title: string; why: string };
  prescription: { tag: string; action: string }[];
};

export function ScanForm({ code, company }: { code: string; company: Company }) {
  const [team, setTeam] = useState("");
  const [role, setRole] = useState<string>("personal");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [concerns, setConcerns] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [noFlags, setNoFlags] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  if (!company) {
    return (
      <main className="mx-auto grid max-w-md gap-4 px-4 py-20 text-center">
        <h1 className="text-[28px] font-bold">Kode perusahaan tidak ditemukan</h1>
        <p className="text-[14.5px] text-bq-ink-2">Minta kode dari HR Anda, lalu masukkan di sini.</p>
        <form action="/brainq/scan" className="flex gap-2">
          <input name="kode" placeholder="Kode perusahaan" className="min-w-0 flex-1 rounded-xl border border-bq-line bg-white px-3 py-2.5 text-[14px] uppercase" />
          <button className="rounded-xl bg-bq-purple px-4 font-semibold text-white">Lanjut</button>
        </form>
      </main>
    );
  }

  if (result) return <ResultView result={result} flagged={flags.length > 0} />;

  const answered = ["demand", ...QUESTION_IDS].filter((id) => answers[id]).length;
  const total = QUESTION_IDS.length + 1;
  const ready = team && answered === total && (flags.length > 0 || noFlags);
  const set = (id: string, v: number) => setAnswers((a) => ({ ...a, [id]: v }));

  async function submit() {
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/brainq/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, team, role, answers, concerns }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Gagal mengirim.");
      setResult(body);
      setState("idle");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim.");
      setState("error");
    }
  }

  return (
    <main className="mx-auto grid max-w-2xl gap-5 px-4 pt-8 pb-4">
      <section>
        <p className="text-[13px] font-semibold text-bq-deep">{company.name} · BrainQ Pulse</p>
        <h1 className="mt-1.5 text-[30px] font-bold tracking-tight sm:text-[38px]">Scan 3 menit</h1>
        <p className="mt-2 text-[15px] text-bq-ink-2">
          20 pertanyaan tentang tidur, fokus, cara berpikir, dan mindset. Anda langsung mendapat hasil pribadi.
          Perusahaan hanya melihat rata-rata tim dengan minimal 8 peserta, tanpa nama.
        </p>
      </section>

      <Block title="Tim dan peran">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-[12.5px] font-semibold text-bq-ink-3">
            Tim Anda
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="rounded-xl border border-bq-line bg-white px-3 py-2.5 text-[14px] font-semibold text-bq-ink">
              <option value="">Pilih tim</option>
              {company.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div className="grid gap-1 text-[12.5px] font-semibold text-bq-ink-3">
            Peran
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={cn("flex-1 rounded-xl border px-3 py-2.5 text-[13.5px] font-semibold", role === r.id ? "border-bq-purple bg-bq-purple text-white" : "border-bq-line bg-white text-bq-ink")}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Scale q={DEMAND} value={answers.demand} onChange={(v) => set("demand", v)} />
      </Block>

      {SECTIONS.map((s) => (
        <Block key={s.title} title={s.title} sub={s.sub}>
          {s.questions.map((q) => <Scale key={q.id} q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} />)}
        </Block>
      ))}

      <Block title="Apa yang paling ingin Anda perbaiki?" sub="Pilih sampai 3. Boleh dilewati.">
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => {
            const on = concerns.includes(c);
            return (
              <button key={c} type="button" aria-pressed={on}
                onClick={() => setConcerns((cs) => on ? cs.filter((x) => x !== c) : cs.length < 3 ? [...cs, c] : cs)}
                className={cn("rounded-full border px-3 py-1.5 text-[13px] font-semibold", on ? "border-bq-purple bg-bq-purple text-white" : "border-bq-line bg-white text-bq-ink-2")}>
                {c}
              </button>
            );
          })}
        </div>
      </Block>

      <Block title="Cek keamanan" sub="Jawaban ini tetap di perangkat Anda. Tidak dikirim ke server dan tidak pernah dilihat perusahaan.">
        <div className="grid gap-2">
          {RED_FLAGS.map((f) => (
            <label key={f} className="flex items-start gap-2.5 text-[13.5px]">
              <input type="checkbox" className="mt-0.5 size-4 accent-[#7c5ce0]" checked={flags.includes(f)}
                onChange={(e) => { setNoFlags(false); setFlags((xs) => e.target.checked ? [...xs, f] : xs.filter((x) => x !== f)); }} />
              {f}
            </label>
          ))}
          <label className="flex items-start gap-2.5 text-[13.5px] font-semibold">
            <input type="checkbox" className="mt-0.5 size-4 accent-[#7c5ce0]" checked={noFlags}
              onChange={(e) => { setNoFlags(e.target.checked); if (e.target.checked) setFlags([]); }} />
            Tidak ada yang sesuai
          </label>
        </div>
      </Block>

      <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-2xl border border-bq-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <span className="text-[13px] text-bq-ink-2">
          <b className="num text-bq-ink">{answered}/{total}</b> terjawab{!team && " · pilih tim"}{!(flags.length || noFlags) && " · cek keamanan"}
        </span>
        <button type="button" disabled={!ready || state === "sending"} onClick={submit}
          className="rounded-full bg-bq-purple px-5 py-2.5 text-[14px] font-bold text-white disabled:bg-bq-violet">
          {state === "sending" ? "Menghitung…" : "Lihat hasil"}
        </button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-[#fdece8] px-4 py-3 text-[13.5px] text-[#b4361f]">{error}</p>}
    </main>
  );
}

function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-[20px] border border-bq-line bg-white p-4 sm:p-5">
      <header>
        <h2 className="text-[17px] font-bold">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-bq-ink-3">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function Scale({ q, value, onChange }: { q: Question; value?: number; onChange: (v: number) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-[14.5px] font-semibold">{q.text}</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
            className={cn("rounded-xl border py-2.5 text-[15px] font-bold", value === v ? "border-bq-purple bg-bq-purple text-white" : "border-bq-line bg-bq-bg text-bq-ink hover:border-bq-violet")}>
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-4 text-[11.5px] text-bq-ink-3"><span>{q.low}</span><span className="text-right">{q.high}</span></div>
    </fieldset>
  );
}

function ResultView({ result, flagged }: { result: Result; flagged: boolean }) {
  return (
    <main className="mx-auto grid max-w-2xl gap-5 px-4 pt-8">
      {flagged && (
        <section className="rounded-[20px] border border-[#b4361f]/30 bg-[#fdece8] p-4 text-[14px] text-[#7a2414] sm:p-5">
          <h2 className="text-[16px] font-bold text-[#7a2414]">Periksakan diri ke dokter lebih dulu</h2>
          <p className="mt-1">Anda menandai tanda yang perlu dievaluasi dokter. BrainQ tidak mendiagnosis kondisi ini. Hubungi dokter umum atau dokter saraf. Untuk gejala mendadak (bicara pelo, wajah mencong, lemah satu sisi), hubungi <b>119</b> atau IGD terdekat segera.</p>
        </section>
      )}
      <section className="rounded-[20px] bg-bq-plum p-5 text-white sm:p-6">
        <p className="text-[13px] font-semibold text-bq-lilac">Hasil BrainQ Anda</p>
        <div className="mt-2 flex items-end gap-3">
          <b className="num text-[56px] leading-none font-extrabold">{result.score}</b>
          <span className="pb-1.5 text-[14px] text-bq-lilac">/100</span>
        </div>
        <p className="mt-2 text-[17px] font-semibold text-white">{result.headline}</p>
      </section>
      <section className="grid gap-3 rounded-[20px] border border-bq-line bg-white p-4 sm:p-5">
        <h2 className="text-[16px] font-bold">Brain 6 Map</h2>
        {result.brain6.map((b) => (
          <div key={b.key} className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-[13px]">
            <span className="font-medium">{b.name}</span>
            <div className="h-3 rounded-full bg-bq-mist"><div className="h-full rounded-full bg-bq-purple" style={{ width: `${b.score}%` }} /></div>
            <b className="num text-right">{b.score}</b>
          </div>
        ))}
      </section>
      <section className="grid gap-2 rounded-[20px] border border-bq-line bg-white p-4 sm:p-5">
        <p className="text-[12.5px] font-semibold text-bq-ink-3">Penghambat utama</p>
        <h2 className="text-[17px] font-bold">{result.bottleneck.title}</h2>
        <p className="text-[14px] text-bq-ink-2">{result.bottleneck.why}</p>
        <p className="mt-2 text-[12.5px] font-semibold text-bq-ink-3">Next Best Brain Move</p>
        <p className="text-[15px] font-semibold text-bq-deep">{result.nextMove.title}</p>
        <p className="text-[14px] text-bq-ink-2">{result.nextMove.why}</p>
      </section>
      <section className="grid gap-2 rounded-[20px] border border-bq-line bg-white p-4 sm:p-5">
        <h2 className="text-[16px] font-bold">5 langkah untuk Anda</h2>
        <ul className="grid gap-2 text-[14px]">
          {result.prescription.map((p) => (
            <li key={p.tag} className="flex gap-2.5"><b className="w-[74px] shrink-0 text-[11px] tracking-wide text-bq-deep">{p.tag}</b>{p.action}</li>
          ))}
        </ul>
      </section>
      <p className="text-[13px] text-bq-ink-2">
        Hasil pribadi ini hanya tampil di layar Anda. Yang tersimpan untuk perusahaan hanya angka tanpa nama, digabung per tim.
        Lanjutkan dengan <a className="font-semibold text-bq-deep underline" href="https://sikutaki-brainq.vercel.app/upgrade-30">Brain Upgrade 30</a>,
        lalu isi Pulse lagi dalam 2 minggu.
      </p>
    </main>
  );
}
