"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { Delta } from "@/components/ui/Delta";
import { inputClass, textareaClass } from "@/components/ui/form";
import { Pills } from "@/components/ui/Segmented";
import { AREAS, areaById, NOW, WEEKS } from "@/lib/data";
import { NOTE_LABEL, noteChange, type Note, type NoteType } from "@/lib/focus";
import { NOTE_TONE } from "../noteTone";

export type NoteDraft = { type: NoteType; area: string; text: string };

const TYPE_OPTIONS = (Object.keys(NOTE_LABEL) as NoteType[]).map((k) => ({ value: k, label: NOTE_LABEL[k] }));

/** HR's own notes for a division: what was planned, done or is being watched. No owner field, not visible to employees. */
export function NotesPanel({ notes, draft, setDraft, onSave }: {
  notes: Note[]; draft: NoteDraft; setDraft: (d: NoteDraft) => void; onSave: () => void;
}) {
  return (
    <Card title="Catatan HR" sub="Untuk HR sendiri: apa yang direncanakan, dilakukan, atau dipantau. Tidak terlihat oleh karyawan.">
      <div id="note-form" className="grid gap-2 border-b border-line pb-3.5">
        <Pills label="Jenis catatan" options={TYPE_OPTIONS} value={draft.type} onChange={(type) => setDraft({ ...draft, type })} />
        <select className={inputClass} value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} aria-label="Area terkait">
          <option value="">Umum, tanpa area</option>
          {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <textarea rows={3} className={textareaClass} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          placeholder="Contoh: bicara dengan lead divisi soal jadwal shift minggu depan" aria-label="Isi catatan" />
        <Button size="sm" className="justify-self-start" disabled={!draft.text.trim()} onClick={onSave}>Simpan catatan</Button>
      </div>
      {notes.length === 0 ? <p className="text-muted">Belum ada catatan untuk divisi ini.</p> : (
        <ul className="grid">
          {notes.map((n) => {
            const change = noteChange(n);
            return (
              <li key={n.id} className="grid gap-1 border-t border-line py-3 first:border-t-0">
                <div className="flex items-center gap-2 text-xs">
                  <Tag tone={NOTE_TONE[n.type]}>{NOTE_LABEL[n.type]}</Tag>
                  <span className="text-muted">{WEEKS[Math.min(n.week, NOW)].label} · {n.by}</span>
                </div>
                <p className="text-[13.5px] leading-normal">{n.text}</p>
                {change && n.area && n.week < NOW && (
                  <small className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    {areaById(n.area).name} sejak catatan ini: <b className="num">{change.before}</b> ke <b className="num">{change.now}</b> <Delta d={change.now - change.before} />
                  </small>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
