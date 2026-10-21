"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { shortDate } from "@/lib/week";
import { JOURNAL, type JournalPractice } from "@/lib/practice";
import { appButton, Note } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";
import { PracticeFrame, useFinish, type Session } from "./PracticeFrame";

type Entry = { day: string; answers: string[] };

/* Journal entries stay in this browser only: they are never sent to the server, so neither Sikutaki nor HR can read them. */
const key = (id: string) => `sikutaki:jurnal:${id}`;

function readEntries(id: string): Entry[] {
  try { return JSON.parse(window.localStorage.getItem(key(id)) ?? "[]") as Entry[]; } catch { return []; }
}
function writeEntries(id: string, entries: Entry[]) {
  try { window.localStorage.setItem(key(id), JSON.stringify(entries)); return true; } catch { return false; }
}

export function JournalScreen({ practice, session }: { practice: JournalPractice; session: Session | null }) {
  const { today, toast } = useEmployee();
  const finish = useFinish(practice, session);
  const prompt = JOURNAL[practice.journal];
  const [answers, setAnswers] = useState(prompt.fields.map(() => ""));
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const saved = readEntries(practice.id);
    setEntries(saved);
    const mine = saved.find((e) => e.day === today);
    if (mine) setAnswers(prompt.fields.map((_, i) => mine.answers[i] ?? ""));
  }, [practice.id, today, prompt.fields]);

  const save = async () => {
    const next = [{ day: today, answers }, ...entries.filter((e) => e.day !== today)].slice(0, 60);
    if (!writeEntries(practice.id, next)) toast("Peramban ini tidak mengizinkan penyimpanan. Tulisanmu tidak tersimpan.");
    await finish();
  };
  const remove = (day: string) => {
    const next = entries.filter((e) => e.day !== day);
    writeEntries(practice.id, next);
    setEntries(next);
  };

  const filled = answers.some((a) => a.trim());
  const long = practice.journal === "ekspresif";

  return (
    <PracticeFrame practice={practice} session={session}>
      <p className="text-[14.5px] leading-relaxed text-body">{prompt.intro}</p>
      <div className="grid gap-3">
        {prompt.fields.map((label, i) => (
          <label key={label} className="grid gap-1.5 text-[13px] font-semibold text-body">
            {label}
            <textarea rows={long ? 10 : 3} value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
              className="w-full rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[15px] font-normal text-ink focus:border-app focus:outline-none" />
          </label>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted"><Icon name="lock" size={13} />Tersimpan hanya di perangkat ini. Tidak dikirim ke server dan tidak bisa dibaca HR.</p>
      <button type="button" disabled={!filled} className={appButton()} onClick={save}>Simpan dan selesai</button>

      {entries.filter((e) => e.day !== today).length > 0 && (
        <details className="rounded-2xl bg-soft p-3.5">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Tulisan sebelumnya di perangkat ini</summary>
          <ul className="mt-2.5 grid gap-2.5">
            {entries.filter((e) => e.day !== today).map((e) => (
              <li key={e.day} className="rounded-xl bg-white p-3 text-[13px] leading-normal text-body">
                <div className="mb-1 flex justify-between"><b className="text-ink">{shortDate(e.day)}</b>
                  <button type="button" className="text-xs text-muted underline" onClick={() => remove(e.day)}>Hapus</button></div>
                {e.answers.filter(Boolean).map((a, i) => <p key={i} className="whitespace-pre-wrap">{a}</p>)}
              </li>
            ))}
          </ul>
          <Note>Menghapus data peramban juga menghapus tulisan ini.</Note>
        </details>
      )}
    </PracticeFrame>
  );
}
