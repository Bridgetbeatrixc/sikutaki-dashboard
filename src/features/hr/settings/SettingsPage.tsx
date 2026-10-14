"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { inputClass, labelClass } from "@/components/ui/form";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SwitchRow } from "@/components/ui/Switch";
import { cn } from "@/lib/cn";
import { COMPANY, MIN_GROUP, PARTNERS, TEAMS } from "@/lib/data";
import { asset } from "@/lib/paths";
import { useHr } from "../HrProvider";

const TABS = ["Organisasi", "Karyawan", "Privasi", "Psikolog mitra", "Notifikasi"] as const;
type Tab = (typeof TABS)[number];

const NOTIFICATIONS = [
  { id: "n1", label: "Ringkasan mingguan lewat email", on: true },
  { id: "n2", label: "Peringatan divisi perlu perhatian", on: true },
  { id: "n3", label: "Partisipasi divisi di bawah 60%", on: true },
  { id: "n4", label: "Laporan bulanan siap", on: false },
];

export function SettingsPage() {
  const { toast } = useHr();
  const [tab, setTab] = useState<Tab>("Organisasi");
  const save = (e: FormEvent) => { e.preventDefault(); toast("Perubahan disimpan"); };

  return (
    <>
      <PageHeader title="Pengaturan" sub={COMPANY.name} />
      <div role="tablist" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("border-b-2 px-3.5 py-2.5 font-semibold whitespace-nowrap", tab === t ? "border-brand text-brand" : "border-transparent text-muted")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Organisasi" && (
        <Card title="Organisasi dan divisi">
          <form className="grid items-center gap-3 sm:grid-cols-[160px_1fr]" onSubmit={save}>
            <label htmlFor="org-name" className={labelClass}>Nama perusahaan</label>
            <input id="org-name" className={inputClass} defaultValue={COMPANY.name} />
            <label htmlFor="org-ind" className={labelClass}>Industri</label>
            <select id="org-ind" className={inputClass} defaultValue="Jasa">{["Jasa", "Manufaktur", "Teknologi", "Keuangan"].map((o) => <option key={o}>{o}</option>)}</select>
            <b className="sm:col-span-2">Divisi ({TEAMS.length})</b>
            <div className="flex flex-wrap gap-1.5 sm:col-span-2">{TEAMS.map((t) => <Tag key={t.id}>{t.name} · {t.size}</Tag>)}</div>
            <Button type="submit" className="justify-self-start sm:col-span-2">Simpan</Button>
          </form>
        </Card>
      )}
      {tab === "Karyawan" && <EmployeesTab />}
      {tab === "Privasi" && <PrivacyTab onSave={save} />}

      {tab === "Psikolog mitra" && (
        <Card title="Psikolog mitra" sub="Karyawan menghubungi langsung dari aplikasi. HR tidak menerima nama.">
          <ul className="grid gap-2.5">
            {PARTNERS.map((p, i) => (
              <li key={p.name} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                {i === 0
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={asset("/img/avatar-psikolog.jpg")} alt="" className="size-11 rounded-xl object-cover" />
                  : <span className="inline-flex size-11 items-center justify-center rounded-xl bg-mint text-brand"><Icon name="chat" size={18} /></span>}
                <div><b>{p.name}</b><small className="block text-muted">{p.focus} · {p.slots}</small></div>
                <Tag>Aktif</Tag>
              </li>
            ))}
          </ul>
          <Button variant="soft" className="justify-self-start" onClick={() => toast("Prototipe: undangan mitra dikirim di versi produksi")}><Icon name="plus" size={16} />Tambah mitra</Button>
        </Card>
      )}

      {tab === "Notifikasi" && (
        <Card title="Notifikasi untuk HR">
          <form className="grid gap-2" onSubmit={save}>
            {NOTIFICATIONS.map((n) => <SwitchRow key={n.id} id={n.id} label={n.label} defaultChecked={n.on} />)}
            <Button type="submit" className="mt-1.5 justify-self-start">Simpan</Button>
          </form>
        </Card>
      )}
    </>
  );
}

function EmployeesTab() {
  const [file, setFile] = useState<{ name: string; rows: number } | null>(null);
  const readCsv = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result).split(/\r?\n/).filter((l) => l.trim()).length - 1;
      setFile({ name: f.name, rows: Math.max(0, rows) });
    };
    reader.readAsText(f);
  };
  return (
    <div className="grid items-start gap-[18px] xl:grid-cols-2">
      <Card title="Unggah daftar karyawan" sub="CSV dengan kolom email dan divisi">
        <label htmlFor="csv" className="relative grid cursor-pointer justify-items-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#d2d2d7] px-4 py-7 text-center text-brand hover:bg-[#f7f8fb]">
          <Icon name="upload" size={22} />
          <b>{file ? file.name : "Pilih atau seret file CSV"}</b>
          <small className="text-muted">{file ? `${file.rows} baris terbaca. Undangan dikirim saat check-in berikutnya.` : "Contoh: email,divisi"}</small>
          <input id="csv" type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => readCsv(e.target.files?.[0])} />
        </label>
      </Card>
      <Card title="Jumlah per divisi" sub="Hanya jumlah. Status per orang tidak ditampilkan.">
        <table className="w-full text-left">
          <thead><tr className="text-xs text-muted"><th className="py-2 font-semibold">Divisi</th><th className="py-2 text-right font-semibold">Terdaftar</th></tr></thead>
          <tbody>{TEAMS.map((t) => <tr key={t.id} className="border-t border-line"><td className="py-2">{t.name}</td><td className="num py-2 text-right">{t.size}</td></tr>)}</tbody>
          <tfoot><tr className="border-t border-line font-bold"><td className="py-2">Total</td><td className="num py-2 text-right">{COMPANY.employees}</td></tr></tfoot>
        </table>
      </Card>
    </div>
  );
}

function PrivacyTab({ onSave }: { onSave: (e: FormEvent) => void }) {
  const [threshold, setThreshold] = useState(MIN_GROUP);
  return (
    <Card title="Privasi" sub="Data kesehatan adalah data pribadi spesifik menurut UU No. 27 Tahun 2022">
      <form className="grid gap-2" onSubmit={onSave}>
        <label htmlFor="thr" className={labelClass}>Ukuran kelompok minimal: <b className="num">{threshold} orang</b></label>
        <input id="thr" type="range" min={5} max={15} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full max-w-[360px] accent-brand" />
        <small className="text-muted">Bisa dinaikkan, tidak bisa di bawah 5.</small>
        <label htmlFor="ret" className={labelClass}>Simpan data jawaban</label>
        <select id="ret" className={cn(inputClass, "justify-self-start")} defaultValue="24 bulan">{["12 bulan", "24 bulan", "36 bulan"].map((o) => <option key={o}>{o}</option>)}</select>
        <ul className="my-2 grid gap-1.5">
          {["Tidak ada skor per orang di dashboard", "Tidak ada ekspor jawaban mentah", "Rujukan psikolog hanya tampil sebagai jumlah bulanan"].map((t) => (
            <li key={t} className="flex items-center gap-2 font-medium text-good"><Icon name="check" size={16} />{t}</li>
          ))}
        </ul>
        <Button type="submit" className="justify-self-start">Simpan</Button>
      </form>
    </Card>
  );
}
