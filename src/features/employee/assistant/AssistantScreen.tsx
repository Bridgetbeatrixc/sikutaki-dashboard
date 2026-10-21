"use client";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { isCrisis, parseReply, systemPrompt, type Piece } from "@/lib/assistant";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { practiceById, programById } from "@/lib/practice";
import { askGemini, GEMINI_MODELS, geminiKey, hasBuiltInKey, loadGemini, saveGemini, type ChatTurn, type GeminiSettings } from "@/store/gemini";
import { appButton, Note } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { cardBackground } from "../exercises/ProgramCard";

type Message = ChatTurn & { error?: boolean };

const STARTERS = ["Aku susah tidur belakangan ini", "Lagi stres karena kerjaan", "Aku cuma mau cerita", "Aku cuma punya 3 menit"];
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
      const system = systemPrompt({
        name: emp.user.name, energy: emp.energy.allowed && emp.energy.optIn, days: emp.days, todayMood: emp.todayLog?.mood ?? null,
        answers: emp.week.answers, programs: emp.programs.map((p) => p.program),
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
    <div className="flex min-h-full flex-col px-[22px] pt-3.5 pb-[104px] md:px-8 md:pt-6 md:pb-8">
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
          return <Card key={i} href={ROUTES.employee.exercise(x.id)} title={x.title} meta={`Latihan · ${x.minutes} menit`} art={cardBackground(x.colors)} />;
        }
        if (p.kind === "program") {
          const x = programById(p.id)!;
          return <Card key={i} href={ROUTES.employee.program(x.id)} title={x.title} meta={x.kind === "praktis" ? `Program · ${x.days} hari` : `Program · ${x.days / 7} minggu`} art="linear-gradient(160deg,#eef4fd,#cfe0f7)" />;
        }
        if (p.kind === "counsel") return <Card key={i} href={ROUTES.employee.counseling} title="Bicara dengan psikolog" meta="Rahasia, langsung ke psikolog mitra" art="linear-gradient(160deg,#e8f1fb,#a9c6ec)" />;
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
