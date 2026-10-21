"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { longDate } from "@/lib/week";
import { recordReferral } from "@/store/employee-actions";
import { createRequest, loadRequests, markRead, sendMessage, setStatus, STATUS_LABEL, TIMES, type CounselRequest } from "@/store/counseling";
import { appButton, Chip, Section } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

const field = "w-full rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[14px] text-ink focus:border-app focus:outline-none";
const STATUS_CLASS: Record<CounselRequest["status"], string> = {
  menunggu: "bg-warn-bg text-[#8a5300]", dijadwalkan: "bg-mint text-app-dark", selesai: "bg-soft text-body", dibatalkan: "bg-soft text-muted",
};

/** Ask HR to arrange a session with a partner psychologist, talk it over, and see the schedule HR sends back. */
export function ScheduleRequests() {
  const [list, setList] = useState<CounselRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [via, setVia] = useState<"form" | "asisten">("form");
  useEffect(() => {
    setList(loadRequests());
    // Opened from the AI assistant's "ajukan jadwal" card.
    const q = new URLSearchParams(window.location.search);
    if (q.get("ajukan")) { setOpen(true); if (q.get("dari") === "asisten") setVia("asisten"); }
  }, []);

  return (
    <section id="jadwal">
      <Section>Atur jadwal lewat HR</Section>
      <p className="-mt-1 mb-2.5 text-[13px] leading-normal text-body">
        Belum tahu harus mulai dari mana? Chat HR dulu, lalu HR mengatur jadwal dengan psikolog mitra. Kamu boleh mengajukan tanpa nama. Isi sesi tetap rahasia antara kamu dan psikolog.
      </p>
      {open ? (
        <RequestForm via={via} onCancel={() => setOpen(false)} onSent={(l) => { setList(l); setOpen(false); }} />
      ) : (
        <button type="button" className={appButton("primary", true, "mt-0")} onClick={() => setOpen(true)}>
          <span className="flex items-center gap-2"><Icon name="chat" size={16} />Chat HR untuk atur jadwal</span>
        </button>
      )}
      {list.length > 0 && <ul className="mt-3 grid gap-2.5">{list.map((r) => <RequestCard key={r.id} r={r} onChange={setList} />)}</ul>}
    </section>
  );
}

function RequestForm({ via, onCancel, onSent }: { via: "form" | "asisten"; onCancel: () => void; onSent: (l: CounselRequest[]) => void }) {
  const { partners, user, toast } = useEmployee();
  const psych = partners.filter((p) => p.kind === "psikolog");
  const [partnerId, setPartnerId] = useState<string>("");
  const [mode, setMode] = useState<"online" | "tatap muka">("online");
  const [times, setTimes] = useState<string[]>([]);
  const [days, setDays] = useState("");
  const [note, setNote] = useState(via === "asisten" ? "Saya diarahkan Asisten AI untuk bicara dengan psikolog. Mohon dibantu atur jadwal." : "");
  const [anon, setAnon] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!times.length) { toast("Pilih minimal satu waktu yang cocok."); return; }
    createRequest({ name: anon ? null : user.name, teamId: user.teamId, partnerId: partnerId || null, mode, times, days: days.trim(), via, note });
    if (partnerId) void recordReferral(partnerId);
    toast("Permintaan terkirim ke HR. Balasan HR muncul di sini.");
    onSent(loadRequests());
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[18px] bg-soft p-3.5">
      <div className="flex items-center justify-between">
        <b className="text-[14.5px]">Ajukan jadwal konseling</b>
        <button type="button" aria-label="Batal" className="text-muted" onClick={onCancel}><Icon name="x" size={18} /></button>
      </div>
      <label className="grid gap-1.5 text-[13px] font-semibold">Psikolog
        <select className={field} value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
          <option value="">Siapa saja yang tersedia</option>
          {psych.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <div className="grid gap-1.5 text-[13px] font-semibold">Cara bertemu
        <div className="flex gap-2">
          <Chip on={mode === "online"} onClick={() => setMode("online")}>Online</Chip>
          <Chip on={mode === "tatap muka"} onClick={() => setMode("tatap muka")}>Tatap muka</Chip>
        </div>
      </div>
      <div className="grid gap-1.5 text-[13px] font-semibold">Waktu yang cocok
        <div className="flex flex-wrap gap-2">
          {TIMES.map((t) => <Chip key={t} on={times.includes(t)} onClick={() => setTimes(times.includes(t) ? times.filter((x) => x !== t) : [...times, t])}>{t}</Chip>)}
        </div>
      </div>
      <label className="grid gap-1.5 text-[13px] font-semibold">Hari yang cocok (opsional)
        <input className={field} value={days} onChange={(e) => setDays(e.target.value)} placeholder="Misalnya Selasa atau Kamis" maxLength={80} />
      </label>
      <label className="grid gap-1.5 text-[13px] font-semibold">Pesan untuk HR (opsional)
        <textarea className={cn(field, "min-h-20 resize-y")} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500}
          placeholder="Tidak perlu menceritakan masalahmu di sini. Cukup hal yang membantu HR mengatur jadwal." />
      </label>
      <label className="flex items-start gap-2.5 text-[13px] text-body">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-app)]" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
        <span>Kirim tanpa nama. HR hanya melihat kode permintaan dan membalas di sini.</span>
      </label>
      <button type="submit" className={appButton("primary", true, "mt-0")}>Kirim ke HR</button>
    </form>
  );
}

function RequestCard({ r, onChange }: { r: CounselRequest; onChange: (l: CounselRequest[]) => void }) {
  const { partners } = useEmployee();
  const [open, setOpen] = useState(r.unreadEmployee || r.status === "menunggu");
  const [text, setText] = useState("");
  const name = (id: string | null) => partners.find((p) => p.id === id)?.name ?? "Psikolog yang tersedia";
  const active = r.status === "menunggu" || r.status === "dijadwalkan";

  const toggle = () => { setOpen(!open); if (!open && r.unreadEmployee) onChange(markRead(r.id, "karyawan")); };
  const send = (e: FormEvent) => { e.preventDefault(); if (!text.trim()) return; onChange(sendMessage(r.id, "karyawan", text)); setText(""); };

  return (
    <li className="grid gap-2.5 rounded-[18px] border-[1.5px] border-line bg-white p-3.5">
      <button type="button" onClick={toggle} className="grid grid-cols-[1fr_auto] items-start gap-2 text-left">
        <span className="min-w-0">
          <b className="block text-[14px] text-ink">{name(r.schedule?.partnerId ?? r.partnerId)}</b>
          <small className="text-xs text-muted">Kode {r.code} · {r.mode} · {r.times.join(", ")}{r.via === "asisten" && " · lewat Asisten AI"}</small>
        </span>
        <span className="flex items-center gap-1.5">
          {r.unreadEmployee && <i className="size-2 rounded-full bg-app" aria-label="Balasan baru" />}
          <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-bold", STATUS_CLASS[r.status])}>{STATUS_LABEL[r.status]}</span>
        </span>
      </button>
      {r.schedule && r.status === "dijadwalkan" && (
        <div className="flex items-center gap-2.5 rounded-xl bg-mint px-3 py-2.5 text-[13px] text-app-dark">
          <Icon name="calendar" size={18} className="shrink-0" />
          <span><b>{longDate(r.schedule.date)}, {r.schedule.time}</b> · {r.schedule.place}</span>
        </div>
      )}
      {open && (
        <>
          <ul className="grid max-h-64 gap-2 overflow-y-auto">
            {r.messages.length === 0 && <li className="text-[12.5px] text-muted">Belum ada pesan. HR akan membalas di sini.</li>}
            {r.messages.map((m, i) => (
              <li key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug", m.from === "karyawan" ? "justify-self-end bg-app text-white" : "justify-self-start bg-soft text-ink")}>
                {m.from === "hr" && <b className="block text-[11px] text-app-dark">HR</b>}{m.text}
              </li>
            ))}
          </ul>
          {active && (
            <form onSubmit={send} className="flex items-center gap-2">
              <input className={cn(field, "py-2.5")} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan untuk HR" maxLength={500} aria-label="Pesan untuk HR" />
              <button type="submit" aria-label="Kirim pesan" className="grid size-10 shrink-0 place-items-center rounded-full bg-app text-white"><Icon name="arrow" size={18} /></button>
            </form>
          )}
          {active && (
            <button type="button" className="justify-self-start text-xs text-muted underline underline-offset-2" onClick={() => onChange(setStatus(r.id, "dibatalkan", "karyawan"))}>
              Batalkan permintaan
            </button>
          )}
        </>
      )}
    </li>
  );
}
