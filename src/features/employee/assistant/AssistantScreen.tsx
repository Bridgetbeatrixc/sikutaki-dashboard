"use client";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { isCrisis, parseReply, systemPrompt, type Action, type Piece } from "@/lib/assistant";
import { cn } from "@/lib/cn";
import { asset, ROUTES } from "@/lib/paths";
import { practiceById, programById, programState, SLOT_LABEL } from "@/lib/practice";
import { loadRequests, STATUS_LABEL } from "@/store/counseling";
import { askGemini, GEMINI_MODELS, geminiKey, hasBuiltInKey, loadGemini, saveGemini, type ChatTurn, type GeminiSettings } from "@/store/gemini";
import { appButton, Note } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { practiceArt, programArt } from "../exercises/ProgramCard";

type Message = ChatTurn & { error?: boolean };

const STARTERS = ["Aku cuma mau cerita", "Aku susah tidur belakangan ini", "Aku cuma punya 3 menit", "Bagaimana kemajuan programku?", "Aku mau atur jadwal dengan psikolog"];
/** The conversation stays in this tab only. */
const CHAT_KEY = "sikutaki:asisten";
const input = "w-full rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[15px] text-ink focus:border-app focus:outline-none";

export function AssistantScreen() {
  const emp = useEmployee();
  const [settings, setSettings] = useState<GeminiSettings>({ apiKey: "", model: GEMINI_MODELS[0] });
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = loadGemini();
    setSettings(s);
    if (!geminiKey(s)) setShowSettings(true);
    try { setMessages(JSON.parse(window.sessionStorage.getItem(CHAT_KEY) ?? "[]") as Message[]); } catch { /* storage blocked */ }
  }, []);
  useEffect(() => {
    try { window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30))); } catch { /* storage blocked */ }
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (raw: string) => {
    const msg = raw.trim();
    if (!msg || busy) return;
    // A failed exchange (the user's message and the error after it) is dropped so it is not sent again.
    const kept = messages.filter((m, i) => !m.error && !messages[i + 1]?.error);
    const history: Message[] = [...kept, { role: "user", text: msg }];
    setMessages(history);
    setText("");
    setBusy(true);
    try {
      const mood = emp.todayLog?.mood ?? null;
      const system = systemPrompt({
        name: emp.user.name, energy: emp.energy.allowed && emp.energy.optIn, days: emp.days, todayMood: mood, answers: emp.week.answers,
        programs: emp.programs.map((e) => {
          const st = programState(e, emp.today, mood);
          return { id: e.program, day: st.day, days: st.program.days, paused: e.paused, sessions: st.slots.map((x) => ({ slot: SLOT_LABEL[x.slot], practice: x.practice, done: x.done })) };
        }),
        doneToday: emp.done,
        requests: loadRequests().filter((r) => r.status !== "dibatalkan").slice(0, 3)
          .map((r) => (r.schedule && r.status === "dijadwalkan" ? `dijadwalkan ${r.schedule.date} ${r.schedule.time}` : STATUS_LABEL[r.status].toLowerCase())),
      });
      const reply = await askGemini(settings, system, history.slice(-12));
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "model", text: e instanceof Error ? e.message : "Terjadi kesalahan.", error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => { e.preventDefault(); void send(text); };
  const crisisShown = messages.some((m) => m.role === "user" && isCrisis(m.text));

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[900px] flex-col px-[22px] pt-3.5 pb-[104px] md:px-8 md:pt-6 md:pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="mt-2.5 text-[26px] font-semibold text-ink">Asisten AI</h1>
          <p className="text-sm leading-relaxed text-body">Ceritakan yang kamu rasakan. Asisten mendengarkan dulu, lalu menyarankan latihan bila kamu butuh.</p>
        </div>
        <button type="button" onClick={() => setShowSettings(!showSettings)} aria-label="Pengaturan asisten" aria-expanded={showSettings}
          className="mt-3 grid size-10 shrink-0 place-items-center rounded-full bg-soft text-ink"><Icon name="cog" size={18} /></button>
      </div>

      {showSettings && <Settings settings={settings} onSave={(s) => { setSettings(s); saveGemini(s); setShowSettings(false); }} />}

      <p className="mt-3 flex gap-2 rounded-2xl bg-soft px-3.5 py-2.5 text-[12px] leading-normal text-body">
        <Icon name="info" size={15} className="mt-px shrink-0 text-app" />
        <span>Versi uji coba. Pesanmu, beserta ringkasan mood, tidur, dan check-in minggu ini, dikirim ke Google Gemini untuk dijawab. Jangan menulis nama lengkap atau data pribadi. Asisten bukan psikolog dan tidak mendiagnosis.</span>
      </p>
      {crisisShown && <Crisis />}

      <div className="mt-4 grid flex-1 content-start gap-3" aria-live="polite">
        {messages.length === 0 && (
          <div className="grid gap-2">
            <small className="text-xs font-semibold text-muted">Coba mulai dengan:</small>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} disabled={busy}
                  className="rounded-full bg-soft px-3.5 py-2 text-left text-[13px] text-body hover:bg-mint">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => m.role === "user" ? (
          <div key={i} className="max-w-[85%] justify-self-end rounded-[18px] rounded-br-md bg-app px-3.5 py-2.5 text-[14px] leading-normal whitespace-pre-wrap text-white">{m.text}</div>
        ) : m.error ? (
          <div key={i} className="max-w-[90%] rounded-[18px] rounded-bl-md border border-[#f1c9c9] bg-[#fdf0f2] px-3.5 py-2.5 text-[13.5px] leading-normal text-[#6b2b39]">{m.text}</div>
        ) : (
          <div key={i} className="grid max-w-[90%] gap-2"><Reply pieces={parseReply(m.text)} /></div>
        ))}
        {busy && <div className="w-fit rounded-[18px] rounded-bl-md bg-soft px-4 py-3 text-[13px] text-muted">Asisten sedang menulis...</div>}
        <div ref={end} />
      </div>

      <form onSubmit={submit} className="sticky bottom-[96px] mt-4 flex gap-2 bg-white pt-2 md:bottom-0">
        <label className="sr-only" htmlFor="chat-input">Pesan untuk asisten</label>
        <textarea id="chat-input" rows={1} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(text); } }}
          placeholder="Tulis yang kamu rasakan..." className={cn(input, "min-h-12 flex-1 resize-none")} />
        <button type="submit" disabled={busy || !text.trim()} aria-label="Kirim" className="grid size-12 shrink-0 place-items-center rounded-full bg-app text-white disabled:opacity-50">
          <Icon name="arrow" size={20} />
        </button>
      </form>
      {messages.length > 0 && (
        <button type="button" onClick={() => setMessages([])} className="mt-2 justify-self-center text-xs text-muted underline underline-offset-2">Hapus percakapan</button>
      )}
    </div>
  );
}

/** Text with **bold**, then a card for each recommendation. */
function Reply({ pieces }: { pieces: Piece[] }) {
  return (
    <>
      {pieces.map((p, i) => {
        if (p.kind === "text") return <div key={i} className="rounded-[18px] rounded-bl-md bg-soft px-3.5 py-2.5 text-[14px] leading-normal whitespace-pre-wrap text-ink">{bold(p.text)}</div>;
        if (p.kind === "practice") {
          const x = practiceById(p.id)!;
          return <Card key={i} href={ROUTES.employee.exercise(x.id)} title={x.title} meta={`Latihan · ${x.minutes} menit`} art={practiceArt(x)} />;
        }
        if (p.kind === "program") {
          const x = programById(p.id)!;
          return <Card key={i} href={ROUTES.employee.program(x.id)} title={x.title} meta={x.kind === "praktis" ? `Program · ${x.days} hari` : `Program · ${x.days / 7} minggu`} art={programArt(x.id)} />;
        }
        if (p.kind === "counsel") return <Card key={i} href={ROUTES.employee.counseling} title="Bicara dengan psikolog" meta="Rahasia, langsung ke psikolog mitra" art={`url("${asset("/img/tentang/tangan.jpg")}") center / cover, #a9c6ec`} />;
        if (p.kind === "request") return <Card key={i} href={ROUTES.employee.requestSession(true)} title="Ajukan jadwal konseling ke HR" meta="Chat HR dulu, boleh tanpa nama" art={`url("${asset("/img/tentang/obrolan.jpg")}") center / cover, #a8d8bf`} />;
        if (p.kind === "action") return <ActionCard key={i} action={p.action} id={p.id} />;
        return <Crisis key={i} />;
      })}
    </>
  );
}

function bold(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part.replace(/^\s*[*-]\s+/gm, "• ")}</Fragment>);
}

function Card({ href, title, meta, art }: { href: string; title: string; meta: string; art: string }) {
  return (
    <Link href={href} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-2xl border-[1.5px] border-line bg-white py-2 pr-3 pl-2 text-ink hover:border-app/50">
      <span className="size-[42px] rounded-xl" style={{ background: art }} />
      <span className="min-w-0"><b className="block text-[13.5px] font-semibold">{title}</b><small className="text-[11.5px] text-muted">{meta}</small></span>
      <Icon name="chevron" size={16} className="text-app" />
    </Link>
  );
}

const ACTION_TEXT: Record<Action, { label: string; done: string }> = {
  mulai: { label: "Mulai program", done: "Program dimulai" },
  jeda: { label: "Jeda program", done: "Program dijeda" },
  lanjutkan: { label: "Lanjutkan program", done: "Program dilanjutkan" },
  hentikan: { label: "Hentikan program", done: "Program dihentikan" },
  selesai: { label: "Catat selesai hari ini", done: "Tercatat selesai" },
};

/** A change the assistant proposed; nothing happens until the employee taps it. Stopping asks once more. */
function ActionCard({ action, id }: { action: Action; id: string }) {
  const emp = useEmployee();
  const [state, setState] = useState<"idle" | "confirm" | "done">("idle");
  const [busy, setBusy] = useState(false);
  const isPractice = action === "selesai";
  const practice = isPractice ? practiceById(id) : undefined;
  const program = isPractice ? undefined : programById(id);
  const enrollment = emp.programs.find((e) => e.program === id);
  const title = practice?.title ?? program?.title ?? id;
  const art = practice ? practiceArt(practice) : programArt(id);

  // Today's program session for this practice, if there is one still open.
  const session = isPractice ? emp.programs.filter((e) => !e.paused).flatMap((e) => programState(e, emp.today, emp.todayLog?.mood ?? null).slots
    .filter((x) => x.practice === id && !x.done).map((x) => ({ enrollment: e.id, slot: x.slot, program: programById(e.program)?.title }))).at(0) : undefined;

  const already = action === "selesai" ? emp.done.includes(id) && !session
    : action === "mulai" ? Boolean(enrollment)
    : action === "jeda" ? Boolean(enrollment?.paused)
    : action === "lanjutkan" ? Boolean(enrollment && !enrollment.paused)
    : !enrollment;
  const missing = !isPractice && action !== "mulai" && !enrollment;

  const run = async () => {
    if (action === "hentikan" && state !== "confirm") { setState("confirm"); return; }
    setBusy(true);
    let ok = false;
    if (action === "mulai") ok = Boolean(await emp.startProgram(id));
    else if (action === "selesai") {
      if (session) ok = await emp.completeSession(session.enrollment, session.slot, id);
      else { emp.markDone(id); ok = true; }
    } else if (enrollment) {
      ok = action === "hentikan" ? await emp.stopProgram(enrollment.id) : await emp.pauseProgram(enrollment.id, action === "jeda");
    }
    setBusy(false);
    if (ok) { setState("done"); emp.toast(`${ACTION_TEXT[action].done}: ${title}`); }
  };

  const meta = isPractice ? (session ? `Sesi ${SLOT_LABEL[session.slot].toLowerCase()} · ${session.program}` : `Latihan · ${practice?.minutes} menit`)
    : enrollment ? `Hari ${programState(enrollment, emp.today, emp.todayLog?.mood ?? null).day} dari ${program?.days}${enrollment.paused ? " · dijeda" : ""}` : `Program · ${program?.days} hari`;
  const done = state === "done" || (already && state === "idle");

  return (
    <div className="grid grid-cols-[42px_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border-[1.5px] border-app/40 bg-white py-2 pr-2 pl-2 text-ink">
      <span className="size-[42px] rounded-xl" style={{ background: art }} />
      <span className="min-w-0"><b className="block text-[13.5px] font-semibold">{title}</b><small className="text-[11.5px] text-muted">{meta}</small></span>
      <div className="col-span-full">
        {missing ? <small className="text-xs text-muted">Program ini tidak sedang berjalan.</small>
          : done ? <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-app"><Icon name="check" size={14} />{state === "done" ? ACTION_TEXT[action].done : "Sudah"}</span>
          : (
            <button type="button" disabled={busy} onClick={run}
              className={cn("w-full rounded-xl px-3 py-2 text-[13px] font-semibold disabled:opacity-50", action === "hentikan" ? "bg-[#fdf0f2] text-[#8a2b3d]" : "bg-app text-white")}>
              {state === "confirm" ? "Ya, hentikan. Kemajuannya tidak bisa dilanjutkan" : ACTION_TEXT[action].label}
            </button>
          )}
      </div>
    </div>
  );
}

function Crisis() {
  return (
    <div className="mt-3 grid gap-1 rounded-2xl bg-[#fdf0f2] px-3.5 py-3 text-[13px] leading-normal text-[#6b2b39]">
      <b>Kamu tidak sendirian. Hubungi bantuan sekarang.</b>
      <span>Healing119 Kemenkes: telepon <a href="tel:119" className="font-semibold underline">119</a> ekstensi 8. Keadaan darurat: <a href="tel:112" className="font-semibold underline">112</a>.</span>
      <Link href={ROUTES.employee.counseling} className="font-semibold underline underline-offset-2">Hubungi psikolog mitra</Link>
    </div>
  );
}

function Settings({ settings, onSave }: { settings: GeminiSettings; onSave: (s: GeminiSettings) => void }) {
  const [key, setKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ apiKey: key.trim(), model: model.trim() || GEMINI_MODELS[0] }); }}
      className="mt-3 grid gap-3 rounded-[18px] border border-line p-3.5">
      <b className="text-[14px] text-ink">Pengaturan Gemini (uji coba)</b>
      <label className="grid gap-1.5 text-[13px] font-semibold text-body">API key Gemini
        <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder={hasBuiltInKey() ? "Memakai key bawaan situs" : "Tempel API key dari Google AI Studio"} className={input} />
      </label>
      <label className="grid gap-1.5 text-[13px] font-semibold text-body">Model
        <input list="gemini-models" value={model} onChange={(e) => setModel(e.target.value)} className={input} />
        <datalist id="gemini-models">{GEMINI_MODELS.map((m) => <option key={m} value={m} />)}</datalist>
      </label>
      <Note>Key disimpan di peramban ini saja dan dikirim langsung ke Google. Untuk uji coba saja, jangan pakai key berbayar produksi. Buat key gratis di aistudio.google.com.</Note>
      <button type="submit" className={appButton("primary", true, "mt-0")}>Simpan</button>
    </form>
  );
}
