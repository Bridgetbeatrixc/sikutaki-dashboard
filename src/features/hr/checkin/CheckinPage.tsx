"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { inputClass, labelClass } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { SwitchRow } from "@/components/ui/Switch";
import { Funnel } from "@/components/charts/Funnel";
import { LineChart } from "@/components/charts/LineChart";
import { cn } from "@/lib/cn";
import { AREA_COUNT, areaById, COMPANY, CORE, isHidden, NOW, PART, participationSeries, respondents, respondentsScope, ROTATING_PER_WEEK, ROTATION, TEAMS, WEEKS } from "@/lib/data";
import { useHr } from "../HrProvider";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((d) => ({ value: d, label: d.slice(0, 3) }));

export function CheckinPage() {
  const { toast } = useHr();
  const [day, setDay] = useState("Rabu");
  const [time, setTime] = useState("09:00");
  const [reminder, setReminder] = useState(true);
  const completed = respondentsScope("all");
  const rotationWeek = NOW % ROTATION.length;

  return (
    <>
      <PageHeader title="Check-in" sub={`Minggu ${WEEKS[NOW].label}: dikirim ${day} ${time}, ditutup Minggu 23.59`} />
      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Minggu ini" sub="Dari undangan sampai selesai">
          <Funnel steps={[{ label: "Dikirim", v: COMPANY.employees }, { label: "Dibuka", v: Math.round(completed * 1.1) }, { label: "Selesai", v: completed }]} />
        </Card>
        <Card title="Jadwal" sub="Berlaku untuk semua divisi">
          <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); toast(`Jadwal disimpan: setiap ${day} pukul ${time}`); }}>
            <span className={labelClass}>Hari kirim</span>
            <Segmented label="Hari kirim" options={DAYS} value={day} onChange={setDay} />
            <label htmlFor="ci-time" className={labelClass}>Jam kirim</label>
            <input id="ci-time" type="time" className={cn(inputClass, "justify-self-start")} value={time} onChange={(e) => setTime(e.target.value)} />
            <SwitchRow id="ci-rem" label="Pengingat otomatis" hint="Dikirim 2 hari kemudian ke yang belum mengisi. HR tidak melihat siapa saja."
              checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
            <Button type="submit" className="mt-1.5 justify-self-start">Simpan jadwal</Button>
          </form>
        </Card>
      </div>

      <Card title="Partisipasi 12 minggu" sub="Seluruh perusahaan">
        <LineChart series={[{ name: "Partisipasi", color: "#2F6BD8", values: participationSeries("all") }]} labels={WEEKS.map((w) => w.label)} min={0} max={100} height={170} unit="%" />
      </Card>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Partisipasi per divisi" sub="Minggu ini">
          <div className="grid gap-2">
            {TEAMS.map((t) => (
              <div key={t.id} className="grid grid-cols-[96px_1fr_40px] items-center gap-2.5 text-[13px] sm:grid-cols-[130px_1fr_44px_56px]">
                <span>{t.name}</span>
                {isHidden(t.id) ? <HiddenNote text="Kurang dari 5 orang" className="col-span-2 px-2.5 py-1 sm:col-span-3" /> : (
                  <>
                    <span className="relative block h-2.5 rounded-full bg-track">
                      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${PART[t.id][NOW]}%`, background: PART[t.id][NOW] < 60 ? "#C27510" : "#2F6BD8" }} />
                    </span>
                    <b className="num text-right">{PART[t.id][NOW]}%</b>
                    <small className="num hidden text-muted sm:inline">{respondents(t.id)}/{t.size}</small>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Rotasi pertanyaan" sub={`${CORE.length + ROTATING_PER_WEEK} pertanyaan per minggu, sekitar 3 menit`}>
          <Fine>Inti setiap minggu: {CORE.map((c) => areaById(c).name).join(", ")}. Ditambah {ROTATING_PER_WEEK} area bergilir, sehingga {AREA_COUNT - CORE.length} area lainnya terukur setiap {ROTATION.length} minggu. Karyawan yang skornya sedang atau tinggi mendapat 1 pertanyaan lanjutan pilihan ganda tentang penyebabnya.</Fine>
          <ol className="grid gap-1.5">
            {ROTATION.map((r, i) => (
              <li key={i} className={cn("grid items-center gap-2.5 rounded-[10px] px-2.5 py-2 sm:grid-cols-[130px_1fr]", i === rotationWeek && "bg-mint")}>
                <span className="text-[13px] font-semibold">Minggu {i + 1}{i === rotationWeek && " · sekarang"}</span>
                <span className="flex flex-wrap gap-1">{r.map((a) => <Tag key={a}>{areaById(a).name}</Tag>)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
