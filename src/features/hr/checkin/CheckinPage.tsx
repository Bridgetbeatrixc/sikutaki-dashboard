"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { HiddenNote } from "@/components/ui/HiddenNote";
import { labelClass } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { SwitchRow } from "@/components/ui/Switch";
import { Funnel } from "@/components/charts/Funnel";
import { LineChart } from "@/components/charts/LineChart";
import { cn } from "@/lib/cn";
import { AREA_COUNT, areaById, CORE, ROTATING_PER_WEEK, ROTATION } from "@/lib/catalog";
import { DAYS_LONG } from "@/lib/week";
import { saveSchedule } from "@/store/hr-actions";
import { useHr } from "../HrProvider";

const DAYS = [1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: DAYS_LONG[d].slice(0, 3) }));

export function CheckinPage() {
  const { m, run } = useHr();
  const c = m.COMPANY;
  const [day, setDay] = useState(String(c.checkinDay));
  const [reminder, setReminder] = useState(c.reminder);
  const cur = m.WEEKS.length - 1;
  const f = m.ds.funnel;
  const rotationWeek = m.rotationAt(cur);
  const parts = m.participationSeries("all");

  return (
    <>
      <PageHeader title="Check-in" sub={`Minggu ${m.WEEKS[cur].label}: dibuka ${DAYS_LONG[c.checkinDay]} di aplikasi karyawan, ditutup Minggu 23.59 WIB`} />
      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Minggu ini" sub="Dari karyawan terdaftar sampai selesai mengisi">
          <Funnel steps={[{ label: "Terdaftar", v: f.registered }, { label: "Membuka", v: f.opened }, { label: "Selesai", v: f.completed }]} />
        </Card>
        <Card title="Jadwal" sub="Berlaku untuk semua divisi">
          <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); run(() => saveSchedule(Number(day), reminder), `Check-in dibuka setiap ${DAYS_LONG[Number(day)]}`); }}>
            <span className={labelClass}>Hari dibuka</span>
            <Segmented label="Hari dibuka" options={DAYS} value={day} onChange={setDay} />
            <Fine>Karyawan bisa mengisi mulai hari ini sampai Minggu 23.59 WIB. Hasil minggu itu tampil di dashboard begitu ada minimal {c.minGroup} penjawab.</Fine>
            <SwitchRow id="ci-rem" label="Pengingat di aplikasi" hint="Karyawan yang belum mengisi melihat pengingat di beranda aplikasinya. HR tidak melihat siapa saja."
              checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
            <Button type="submit" className="mt-1.5 justify-self-start">Simpan jadwal</Button>
          </form>
        </Card>
      </div>

      <Card title="Partisipasi 12 minggu" sub="Seluruh perusahaan">
        <LineChart series={[{ name: "Partisipasi", color: "#2F6BD8", values: parts }]} labels={m.WEEKS.map((w) => w.label)} min={0} max={100} height={170} unit="%" />
      </Card>

      <div className="grid items-start gap-[18px] xl:grid-cols-2">
        <Card title="Partisipasi per divisi" sub="Minggu ini">
          <div className="grid gap-2">
            {m.TEAMS.map((t) => {
              const p = m.part(t.id, cur);
              return (
                <div key={t.id} className="grid grid-cols-[96px_1fr_40px] items-center gap-2.5 text-[15.5px] sm:grid-cols-[130px_1fr_44px_56px]">
                  <span>{t.name}</span>
                  {m.respondents(t.id, cur) < c.minGroup ? <HiddenNote text={`Kurang dari ${c.minGroup} orang`} className="col-span-2 px-2.5 py-1 sm:col-span-3" /> : (
                    <>
                      <span className="relative block h-2.5 rounded-full bg-track">
                        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p}%`, background: p < 60 ? "#C27510" : "#2F6BD8" }} />
                      </span>
                      <b className="num text-right">{p}%</b>
                      <small className="num hidden text-muted sm:inline">{m.respondents(t.id, cur)}/{t.size}</small>
                    </>
                  )}
                </div>
              );
            })}
            {m.TEAMS.length === 0 && <p className="text-muted">Belum ada divisi.</p>}
          </div>
        </Card>
        <Card title="Rotasi pertanyaan" sub={`${CORE.length + ROTATING_PER_WEEK} pertanyaan per minggu, sekitar 3 menit`}>
          <Fine>Inti setiap minggu: {CORE.map((a) => areaById(a).name).join(", ")}. Ditambah {ROTATING_PER_WEEK} area bergilir, sehingga {AREA_COUNT - CORE.length} area lainnya terukur setiap {ROTATION.length} minggu. Karyawan yang skornya sedang atau tinggi mendapat 1 pertanyaan lanjutan pilihan ganda tentang penyebabnya.</Fine>
          <ol className="grid gap-1.5">
            {ROTATION.map((r, i) => (
              <li key={i} className={cn("grid items-center gap-2.5 rounded-[10px] px-2.5 py-2 sm:grid-cols-[130px_1fr]", i === rotationWeek && "bg-mint")}>
                <span className="text-[15.5px] font-semibold">Minggu {i + 1}{i === rotationWeek && " · sekarang"}</span>
                <span className="flex flex-wrap gap-1">{r.map((a) => <Tag key={a}>{areaById(a).name}</Tag>)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
