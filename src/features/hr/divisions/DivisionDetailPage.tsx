"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/Chip";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { Icon } from "@/components/ui/Icon";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompareBars } from "@/components/charts/CompareBars";
import { fitRange, LineChart } from "@/components/charts/LineChart";
import { AREA_COUNT, AREAS, GROUPS, groupOf, NOTE_LABEL, wellbeingBand } from "@/lib/catalog";
import { decimal } from "@/lib/format";
import { ROUTES } from "@/lib/paths";
import { addNote, deleteNote } from "@/store/hr-actions";
import { useHr } from "../HrProvider";
import { FocusCard } from "./FocusCard";
import { NotesPanel, type NoteDraft } from "./NotesPanel";

const crumbs = [{ label: "Divisi", href: ROUTES.hr.divisions }];
const EMPTY_DRAFT: NoteDraft = { type: "rencana", area: "", text: "" };

export function DivisionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { m, run } = useHr();
  const [draft, setDraft] = useState<NoteDraft>(EMPTY_DRAFT);
  const team = m.teamById(id);
  const myNotes = m.ds.notes.filter((n) => n.team === id).reverse();

  const save = async () => {
    const res = await run(() => addNote(id, draft.type, draft.area, draft.text), "Catatan disimpan");
    if (res.ok) setDraft(EMPTY_DRAFT);
  };
  const remove = (noteId: string) => {
    if (window.confirm("Hapus catatan ini?")) run(() => deleteNote(noteId), "Catatan dihapus");
  };
  const notesPanel = <NotesPanel notes={myNotes} draft={draft} setDraft={setDraft} onSave={save} onDelete={remove} />;
  const sub = `${team?.size ?? 0} orang terdaftar${team?.lead ? ` · lead ${team.lead}` : ""}`;

  if (!team) return <PageHeader title="Divisi tidak ditemukan" crumbs={crumbs} />;
  if (m.isEmpty || m.isHidden(id)) {
    return (
      <>
        <PageHeader title={team.name} crumbs={crumbs} sub={sub} />
        <Card><HiddenNote text={`Divisi ini punya ${m.isEmpty ? 0 : m.respondents(id)} penjawab di minggu terakhir. Skor ditampilkan mulai ${m.MIN_GROUP} penjawab agar tidak ada yang bisa dikenali.`} /></Card>
        <div className="grid items-start gap-[18px] xl:grid-cols-2">{notesPanel}</div>
      </>
    );
  }

  const { NOW } = m;
  const wb = m.wellbeing(id), status = m.teamStatus(id), sleep = m.sleepHours(id), mood = m.moodAvg(id);
  const prevWb = m.wellbeing(id, NOW - 2), prevSleep = m.sleepHours(id, NOW - 4), part = m.part(id);
  const companyMood = m.moodAvg("all");
  const focus = m.focusAreas(id);
  const series = m.wellbeingSeries(id), company = m.wellbeingSeries("all");

  const applyIdea = (text: string, area: string) => {
    setDraft({ type: "rencana", area, text });
    document.getElementById("note-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <PageHeader title={team.name} crumbs={crumbs} sub={<>{sub} · <StatusChip s={status} small /></>} />

      <KpiGrid>
        <Kpi label="Indeks wellbeing" value={wb ?? "Belum cukup data"} unit={wb === null ? undefined : "/100"} delta={prevWb === null || wb === null ? undefined : wb - prevWb} goodWhenUp foot={`${wb === null ? "" : `${wellbeingBand(wb).label} · `}perusahaan ${m.wellbeing("all") ?? "belum cukup data"}`} />
        <Kpi label="Partisipasi check-in" value={part} unit="%" delta={(() => { const prev = m.participationSeries(id)[NOW - 1]; return prev == null ? undefined : part - prev; })()} goodWhenUp foot={`${m.respondents(id)} dari ${team.size} orang`} />
        <Kpi label="Mood harian" value={mood === null ? "-" : decimal(mood)} unit={mood === null ? undefined : "/5"} foot={mood === null ? `tampil mulai ${m.MIN_GROUP} orang mencatat` : `perusahaan ${companyMood === null ? "-" : decimal(companyMood)}`} />
        <Kpi label="Jam tidur" value={sleep === null ? "-" : decimal(sleep)} unit={sleep === null ? undefined : " jam"} delta={sleep === null || prevSleep === null ? undefined : Math.round((sleep - prevSleep) * 10) / 10} goodWhenUp foot="dibanding 4 minggu lalu" />
      </KpiGrid>

      <h2 className="mt-1.5 flex items-center gap-2 text-[19px] font-bold">
        Fokus divisi ini <span className="rounded-full bg-[#edeff4] px-2.5 py-0.5 text-[14px] font-bold text-muted">{focus.length}</span>
      </h2>
      {focus.length === 0
        ? <Card><div className="flex items-center gap-2 py-3 font-semibold text-good"><Icon name="check" size={20} />Semua area di divisi ini berada di level baik.</div></Card>
        : <div className="grid gap-3.5">{focus.map((f) => <FocusCard key={f.area} team={id} focus={f} onIdea={applyIdea} />)}</div>}

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        {notesPanel}
        <Card title="Wellbeing 12 minggu" sub="Divisi ini dibanding perusahaan. Garis putus-putus = catatan HR.">
          <LineChart labels={m.WEEKS.map((w) => w.label)} {...fitRange([...series, ...company])} height={220}
            series={[{ name: team.name, color: status === "perhatian" ? "#B03424" : "#0A66F5", values: series }, { name: "Perusahaan", color: "#86868B", values: company }]}
            markers={myNotes.filter((n) => n.week >= 0 && n.week <= NOW).sort((a, b) => a.week - b.week).map((n) => ({ i: n.week, label: NOTE_LABEL[n.type] }))} />
        </Card>
      </div>

      <Card title={`${AREA_COUNT} area dibanding perusahaan`} sub={`Garis kecil = rata-rata perusahaan. Makin panjang makin perlu perhatian. ${m.scoredAreas(id).length} dari ${AREA_COUNT} area sudah terukur dalam 8 minggu terakhir.`}>
        <div className="grid items-start gap-x-7 gap-y-[18px] xl:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.id} className="grid content-start gap-1">
              <span className="mt-1 text-[14px] font-bold tracking-wider uppercase" style={{ color: g.color }}>{g.name}</span>
              <CompareBars onSelect={(aid) => router.push(ROUTES.hr.area(aid))}
                items={AREAS.filter((a) => a.group === g.id).flatMap((a) => {
                  const v = m.areaValue(id, a.id);
                  return v === null ? [] : [{ id: a.id, label: a.name, color: groupOf(a.group).color, v, ref: m.areaValue("all", a.id) ?? undefined }];
                })} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
