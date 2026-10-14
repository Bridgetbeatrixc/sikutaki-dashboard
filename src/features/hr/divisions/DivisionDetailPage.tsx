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
import { AREAS, areaValue, GROUPS, groupOf, isHidden, NOW, PART, respondents, teamById, teamStatus, VAL, wellbeing, wellbeingSeries, WEEKS } from "@/lib/data";
import { focusAreas, moodAvg, NOTE_LABEL, sleepHours } from "@/lib/focus";
import { decimal } from "@/lib/format";
import { ROUTES } from "@/lib/paths";
import { useHr } from "../HrProvider";
import { FocusCard } from "./FocusCard";
import { NotesPanel, type NoteDraft } from "./NotesPanel";

const crumbs = [{ label: "Divisi", href: ROUTES.hr.divisions }];
const EMPTY_DRAFT: NoteDraft = { type: "rencana", area: "", text: "" };

export function DivisionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { notes, addNote, toast } = useHr();
  const [draft, setDraft] = useState<NoteDraft>(EMPTY_DRAFT);
  const team = teamById(id);

  if (!team) return <PageHeader title="Divisi tidak ditemukan" crumbs={crumbs} />;
  if (isHidden(id)) {
    return (
      <>
        <PageHeader title={team.name} crumbs={crumbs} sub={`${team.size} orang · lead ${team.lead}`} />
        <Card><HiddenNote text={`Divisi ini hanya punya ${respondents(id)} penjawab minggu ini. Skor ditampilkan mulai 5 penjawab agar tidak ada yang bisa dikenali.`} /></Card>
      </>
    );
  }

  const wb = wellbeing(id), status = teamStatus(id), sleep = sleepHours(id);
  const focus = focusAreas(id);
  const myNotes = notes.filter((n) => n.team === id).sort((a, b) => b.week - a.week);
  const series = wellbeingSeries(id), company = wellbeingSeries("all");

  const applyIdea = (text: string, area: string) => {
    setDraft({ type: "rencana", area, text });
    document.getElementById("note-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const save = () => {
    addNote({ team: id, week: NOW, type: draft.type, area: draft.area || undefined, text: draft.text.trim(), by: "Rina A." });
    setDraft(EMPTY_DRAFT);
    toast("Catatan disimpan");
  };

  return (
    <>
      <PageHeader title={team.name} crumbs={crumbs} sub={<>{team.size} orang · lead {team.lead} · <StatusChip s={status} small /></>} />

      <KpiGrid>
        <Kpi label="Indeks wellbeing" value={wb} unit="/100" delta={wb - wellbeing(id, NOW - 2)} goodWhenUp foot={`perusahaan ${wellbeing("all")}`} />
        <Kpi label="Partisipasi check-in" value={PART[id][NOW]} unit="%" delta={PART[id][NOW] - PART[id][NOW - 1]} goodWhenUp foot={`${respondents(id)} dari ${team.size} orang`} />
        <Kpi label="Mood harian" value={decimal(moodAvg(id))} unit="/5" foot={`perusahaan ${decimal(moodAvg("all"))}`} />
        <Kpi label="Jam tidur" value={decimal(sleep)} unit=" jam" delta={Math.round((sleep - sleepHours(id, NOW - 4)) * 10) / 10} goodWhenUp foot="dibanding 4 minggu lalu" />
      </KpiGrid>

      <h2 className="mt-1.5 flex items-center gap-2 text-[17px] font-bold">
        Fokus divisi ini <span className="rounded-full bg-[#edeff4] px-2.5 py-0.5 text-xs font-bold text-muted">{focus.length}</span>
      </h2>
      {focus.length === 0
        ? <Card><div className="flex items-center gap-2 py-3 font-semibold text-good"><Icon name="check" size={20} />Semua area di divisi ini berada di level baik.</div></Card>
        : <div className="grid gap-3.5">{focus.map((f) => <FocusCard key={f.area} team={id} focus={f} onIdea={applyIdea} />)}</div>}

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <NotesPanel notes={myNotes} draft={draft} setDraft={setDraft} onSave={save} />
        <Card title="Wellbeing 12 minggu" sub="Divisi ini dibanding perusahaan. Garis putus-putus = catatan HR.">
          <LineChart labels={WEEKS.map((w) => w.label)} {...fitRange([...series, ...company])} height={220}
            series={[{ name: team.name, color: status === "perhatian" ? "#B03424" : "#0A66F5", values: series }, { name: "Perusahaan", color: "#86868B", values: company }]}
            markers={myNotes.filter((n) => n.week <= NOW).sort((a, b) => a.week - b.week).map((n) => ({ i: n.week, label: NOTE_LABEL[n.type] }))} />
        </Card>
      </div>

      <Card title="17 area dibanding perusahaan" sub="Garis kecil = rata-rata perusahaan. Makin panjang makin perlu perhatian.">
        <div className="grid items-start gap-x-7 gap-y-[18px] xl:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.id} className="grid content-start gap-1">
              <span className="mt-1 text-xs font-bold tracking-wider uppercase" style={{ color: g.color }}>{g.name}</span>
              <CompareBars onSelect={(aid) => router.push(ROUTES.hr.area(aid))}
                items={AREAS.filter((a) => a.group === g.id).map((a) => ({ id: a.id, label: a.name, color: groupOf(a.group).color, v: VAL[id][a.id][NOW], ref: areaValue("all", a.id) }))} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
