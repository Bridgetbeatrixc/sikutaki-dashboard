"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { inputClass, labelClass } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { longDate, today } from "@/lib/week";
import { loadRequests, markRead, sendMessage, setSchedule, setStatus, STATUS_LABEL, type CounselRequest } from "@/store/counseling";
import { useHr } from "../HrProvider";

const STATUS_CLASS: Record<CounselRequest["status"], string> = {
  menunggu: "bg-warn-bg text-warn", dijadwalkan: "bg-good-bg text-good", selesai: "bg-canvas text-muted", dibatalkan: "bg-canvas text-muted",
};

/**
 * Counseling requests from employees: HR replies in a short thread and sends back a schedule with a partner psychologist.
 * Only what the employee chose to share is here; the session itself is not recorded.
 */
export function CounselingRequestsPage() {
  const { m, toast } = useHr();
  const [list, setList] = useState<CounselRequest[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { const l = loadRequests(); setList(l); setSel(l[0]?.id ?? null); }, []);

  const current = list.find((r) => r.id === sel) ?? null;
  const open = list.filter((r) => r.status === "menunggu").length;
  const choose = (id: string) => { setSel(id); setList(markRead(id, "hr")); };
  const team = (id: string | null) => m.ds.teams.find((t) => t.id === id)?.name ?? "Divisi tidak diisi";
  const partner = (id: string | null) => m.ds.partners.find((p) => p.id === id)?.name ?? "Siapa saja yang tersedia";

  return (
    <>
      <PageHeader title="Permintaan konseling" sub={<span>{open ? `${open} menunggu jadwal` : "Tidak ada yang menunggu"} · karyawan boleh mengajukan tanpa nama</span>} />
      {list.length === 0 ? (
        <Card>
          <div className="grid justify-items-center gap-2 py-8 text-center">
            <Icon name="chat" size={28} className="text-muted" />
            <b>Belum ada permintaan</b>
            <Fine className="max-w-md">Karyawan bisa mengajukan jadwal dari menu Konseling di aplikasi karyawan, atau lewat Asisten AI. Permintaan muncul di sini.</Fine>
          </div>
        </Card>
      ) : (
        <div className="grid items-start gap-3.5 lg:grid-cols-[340px_1fr]">
          <Card flush>
            <ul className="divide-y divide-line">
              {list.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => choose(r.id)} className={cn("grid w-full gap-1 px-4 py-3 text-left hover:bg-canvas", sel === r.id && "bg-mint")}>
                    <span className="flex items-center justify-between gap-2">
                      <b className="text-[14px]">{r.name ?? `Tanpa nama · ${r.code}`}</b>
                      <span className="flex items-center gap-1.5">
                        {r.unreadHr && <i className="size-2 rounded-full bg-brand" aria-label="Pesan baru" />}
                        <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", STATUS_CLASS[r.status])}>{STATUS_LABEL[r.status]}</span>
                      </span>
                    </span>
                    <small className="text-xs text-muted">{team(r.teamId)} · {r.mode} · {r.times.join(", ")}{r.via === "asisten" && " · lewat Asisten AI"}</small>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          {current && <Detail key={current.id} r={current} team={team(current.teamId)} partnerName={partner(current.partnerId)} onChange={setList} toast={toast} />}
        </div>
      )}
      <Fine>Permintaan ini hanya untuk mengatur jadwal. Jangan meminta karyawan menceritakan masalahnya di sini, dan jangan membagikannya ke atasan.</Fine>
    </>
  );
}

function Detail({ r, team, partnerName, onChange, toast }: {
  r: CounselRequest; team: string; partnerName: string; onChange: (l: CounselRequest[]) => void; toast: (msg: string) => void;
}) {
  const { m } = useHr();
  const psych = m.ds.partners.filter((p) => p.kind === "psikolog" && !p.suspended);
  const [text, setText] = useState("");
  const [date, setDate] = useState(r.schedule?.date ?? today());
  const [time, setTime] = useState(r.schedule?.time ?? "19.00");
  const [pid, setPid] = useState(r.schedule?.partnerId ?? r.partnerId ?? psych[0]?.id ?? "");
  const [place, setPlace] = useState(r.schedule?.place ?? (r.mode === "online" ? "Online, tautan dikirim psikolog" : "Ruang konseling lantai 3"));
  const active = r.status === "menunggu" || r.status === "dijadwalkan";

  const send = (e: FormEvent) => { e.preventDefault(); if (!text.trim()) return; onChange(sendMessage(r.id, "hr", text)); setText(""); };
  const schedule = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !time.trim()) return;
    onChange(setSchedule(r.id, { date, time: time.trim(), partnerId: pid || null, place: place.trim() || "Akan dikabari" }));
    toast("Jadwal terkirim ke karyawan");
  };

  return (
    <div className="grid gap-3.5">
      <Card title={r.name ?? `Tanpa nama · ${r.code}`} sub={`${team} · diajukan ${longDate(r.createdAt.slice(0, 10))}${r.via === "asisten" ? " lewat Asisten AI" : ""}`}
        action={active ? <Button variant="soft" size="sm" onClick={() => onChange(setStatus(r.id, "selesai", "hr"))}>Tandai selesai</Button> : undefined}>
        <dl className="grid gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-2">
          <div><dt className="text-muted">Psikolog yang diminta</dt><dd className="font-semibold">{partnerName}</dd></div>
          <div><dt className="text-muted">Cara bertemu</dt><dd className="font-semibold capitalize">{r.mode}</dd></div>
          <div><dt className="text-muted">Waktu yang cocok</dt><dd className="font-semibold">{r.times.join(", ")}</dd></div>
          <div><dt className="text-muted">Hari yang cocok</dt><dd className="font-semibold">{r.days || "Tidak diisi"}</dd></div>
        </dl>
        {r.schedule && r.status === "dijadwalkan" && (
          <p className="flex items-center gap-2 rounded-[10px] bg-good-bg px-3 py-2 text-[13px] text-good">
            <Icon name="calendar" size={16} />Terjadwal {longDate(r.schedule.date)}, {r.schedule.time} · {r.schedule.place}
          </p>
        )}
      </Card>

      <Card title="Percakapan" sub="Balas karyawan untuk menyepakati waktu">
        <ul className="grid max-h-72 gap-2 overflow-y-auto">
          {r.messages.length === 0 && <li className="text-[13px] text-muted">Belum ada pesan.</li>}
          {r.messages.map((msg, i) => (
            <li key={i} className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug", msg.from === "hr" ? "justify-self-end bg-brand text-white" : "justify-self-start bg-canvas text-ink")}>
              {msg.from === "karyawan" && <b className="block text-[11px] text-muted">Karyawan</b>}{msg.text}
            </li>
          ))}
        </ul>
        {active && (
          <form onSubmit={send} className="flex gap-2">
            <input className={cn(inputClass, "flex-1")} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis balasan" maxLength={500} aria-label="Balasan untuk karyawan" />
            <Button type="submit">Kirim</Button>
          </form>
        )}
      </Card>

      {active && (
        <Card title={r.status === "dijadwalkan" ? "Ubah jadwal" : "Kirim jadwal"} sub="Pastikan waktunya sudah disepakati dengan psikolog">
          <form onSubmit={schedule} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1"><span className={labelClass}>Tanggal</span>
              <input type="date" className={inputClass} value={date} min={today()} onChange={(e) => setDate(e.target.value)} required /></label>
            <label className="grid gap-1"><span className={labelClass}>Jam (WIB)</span>
              <input className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} placeholder="19.00" required maxLength={20} /></label>
            <label className="grid gap-1"><span className={labelClass}>Psikolog</span>
              <select className={inputClass} value={pid} onChange={(e) => setPid(e.target.value)}>
                {psych.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></label>
            <label className="grid gap-1"><span className={labelClass}>Tempat atau tautan</span>
              <input className={inputClass} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={120} /></label>
            <div className="sm:col-span-2"><Button type="submit"><Icon name="calendar" size={16} />Kirim jadwal ke karyawan</Button></div>
          </form>
        </Card>
      )}
    </div>
  );
}
