"use client";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { inputClass, labelClass } from "@/components/ui/form";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { MIN_GROUP } from "@/lib/catalog";
import { addPartner, addTeam, createResetLink, deleteTeam, removePartner, renameTeam, savePrivacy, updateCompany } from "@/server/actions/hr";
import { useHr } from "../HrProvider";
import { InviteCard } from "../InviteCard";

const TABS = [
  { id: "organisasi", label: "Organisasi" },
  { id: "karyawan", label: "Karyawan" },
  { id: "privasi", label: "Privasi" },
  { id: "mitra", label: "Psikolog mitra" },
] as const;
type Tab = (typeof TABS)[number]["id"];
const INDUSTRIES = ["Jasa", "Manufaktur", "Teknologi", "Keuangan", "Ritel", "Kesehatan", "Pendidikan", "Pemerintahan", "Lainnya"];

export function SettingsPage() {
  const { m } = useHr();
  const params = useSearchParams();
  const initial = TABS.find((t) => t.id === params.get("tab"))?.id ?? "organisasi";
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <>
      <PageHeader title="Pengaturan" sub={m.COMPANY.name} />
      <div role="tablist" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cn("border-b-2 px-3.5 py-2.5 font-semibold whitespace-nowrap", tab === t.id ? "border-brand text-brand" : "border-transparent text-muted")}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "organisasi" && <OrganisationTab />}
      {tab === "karyawan" && <EmployeesTab />}
      {tab === "privasi" && <PrivacyTab />}
      {tab === "mitra" && <PartnersTab />}
    </>
  );
}

function OrganisationTab() {
  const { m, run, pending } = useHr();
  const [newTeam, setNewTeam] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(() => updateCompany(String(f.get("name")), String(f.get("industry"))), "Perubahan disimpan");
  };
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const res = await run(() => addTeam(newTeam), `Divisi ${newTeam.trim()} ditambahkan`);
    if (res.ok) setNewTeam("");
  };
  const rename = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await run(() => renameTeam(editing.id, editing.name), "Nama divisi diubah");
    if (res.ok) setEditing(null);
  };

  return (
    <div className="grid items-start gap-[18px] xl:grid-cols-2">
      <Card title="Organisasi">
        <form className="grid items-center gap-3 sm:grid-cols-[150px_1fr]" onSubmit={save}>
          <label htmlFor="org-name" className={labelClass}>Nama perusahaan</label>
          <input id="org-name" name="name" required className={inputClass} defaultValue={m.COMPANY.name} />
          <label htmlFor="org-ind" className={labelClass}>Industri</label>
          <select id="org-ind" name="industry" className={inputClass} defaultValue={m.COMPANY.industry || INDUSTRIES[0]}>
            {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <Button type="submit" disabled={pending} className="justify-self-start sm:col-span-2">Simpan</Button>
        </form>
      </Card>
      <Card title={`Divisi (${m.TEAMS.length})`} sub="Karyawan memilih divisinya saat bergabung, dan bisa mengubahnya di profil.">
        <ul className="grid">
          {m.TEAMS.map((t) => (
            <li key={t.id} className="flex items-center gap-2 border-t border-line py-2 first:border-t-0">
              {editing?.id === t.id ? (
                <form onSubmit={rename} className="flex flex-1 flex-wrap gap-2">
                  <input autoFocus aria-label="Nama divisi" className={cn(inputClass, "min-w-0 flex-1")} value={editing.name} onChange={(e) => setEditing({ id: t.id, name: e.target.value })} />
                  <Button type="submit" size="sm">Simpan</Button>
                  <Button size="sm" variant="soft" onClick={() => setEditing(null)}>Batal</Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 font-medium">{t.name}</span>
                  <span className="num text-[13px] text-muted">{t.size} orang</span>
                  {m.live && (
                    <>
                      <Button size="sm" variant="link" onClick={() => setEditing({ id: t.id, name: t.name })}>Ubah</Button>
                      <button type="button" aria-label={`Hapus ${t.name}`} className="p-1 text-muted hover:text-bad"
                        onClick={() => window.confirm(`Hapus divisi ${t.name}?`) && run(() => deleteTeam(t.id), "Divisi dihapus")}>
                        <Icon name="trash" size={15} />
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={add} className="flex flex-wrap gap-2 border-t border-line pt-3">
          <input aria-label="Nama divisi baru" placeholder="Nama divisi baru" className={cn(inputClass, "min-w-0 flex-1")} value={newTeam} onChange={(e) => setNewTeam(e.target.value)} />
          <Button type="submit" disabled={!newTeam.trim() || pending}><Icon name="plus" size={15} />Tambah</Button>
        </form>
      </Card>
    </div>
  );
}

function EmployeesTab() {
  const { m, run, pending } = useHr();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setLink(null);
    const res = await run(() => createResetLink(email));
    if (res.ok && res.value) setLink(`${window.location.origin}${res.value}`);
  };
  return (
    <div className="grid items-start gap-[18px] xl:grid-cols-2">
      <div className="grid min-w-0 gap-[18px]">
        <InviteCard />
        <Card title="Karyawan lupa kata sandi" sub="Buat tautan sekali pakai, lalu kirimkan ke karyawan itu secara pribadi. Berlaku 3 hari.">
          <form onSubmit={reset} className="flex flex-wrap gap-2">
            <input type="email" required aria-label="Email karyawan" placeholder="email@perusahaan.com" className={cn(inputClass, "min-w-0 flex-1")} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" disabled={pending}>Buat tautan</Button>
          </form>
          {link && (
            <div className="grid gap-1.5 rounded-xl bg-mint p-3 text-[13px]">
              <b>Tautan reset untuk {email}</b>
              <input readOnly value={link} aria-label="Tautan reset" className={cn(inputClass, "text-[12.5px]")} onFocus={(e) => e.currentTarget.select()} />
              <span className="text-muted">Tautan ini hanya bisa dipakai sekali. Jangan bagikan di grup.</span>
            </div>
          )}
        </Card>
      </div>
      <Card title="Jumlah per divisi" sub="Hanya jumlah. Status per orang tidak ditampilkan.">
        <table className="w-full text-left">
          <thead><tr className="text-xs text-muted"><th className="py-2 font-semibold">Divisi</th><th className="py-2 text-right font-semibold">Terdaftar</th></tr></thead>
          <tbody>{m.TEAMS.map((t) => <tr key={t.id} className="border-t border-line"><td className="py-2">{t.name}</td><td className="num py-2 text-right">{t.size}</td></tr>)}</tbody>
          <tfoot><tr className="border-t border-line font-bold"><td className="py-2">Total</td><td className="num py-2 text-right">{m.COMPANY.employees}</td></tr></tfoot>
        </table>
      </Card>
    </div>
  );
}

function PrivacyTab() {
  const { m, run, pending } = useHr();
  const [threshold, setThreshold] = useState(m.COMPANY.minGroup);
  const [retention, setRetention] = useState(m.COMPANY.retentionMonths);
  const save = (e: FormEvent) => { e.preventDefault(); run(() => savePrivacy(threshold, retention), "Pengaturan privasi disimpan"); };
  return (
    <Card title="Privasi" sub="Data kesehatan adalah data pribadi spesifik menurut UU No. 27 Tahun 2022">
      <form className="grid gap-2" onSubmit={save}>
        <label htmlFor="thr" className={labelClass}>Ukuran kelompok minimal: <b className="num">{threshold} orang</b></label>
        <input id="thr" type="range" min={MIN_GROUP} max={15} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full max-w-[360px] accent-brand" />
        <small className="text-muted">Bisa dinaikkan, tidak bisa di bawah {MIN_GROUP}. Divisi dengan penjawab lebih sedikit tidak menampilkan skor apa pun.</small>
        <label htmlFor="ret" className={labelClass}>Simpan data jawaban</label>
        <select id="ret" className={cn(inputClass, "justify-self-start")} value={retention} onChange={(e) => setRetention(Number(e.target.value))}>
          {[12, 24, 36].map((o) => <option key={o} value={o}>{o} bulan</option>)}
        </select>
        <small className="text-muted">Jawaban check-in dan catatan harian yang lebih lama dihapus permanen.</small>
        <ul className="my-2 grid gap-1.5">
          {["Tidak ada skor per orang di dashboard", "Tidak ada ekspor jawaban mentah", "Kontak psikolog hanya tampil sebagai jumlah bulanan", "Karyawan bisa menghapus akun dan seluruh datanya sendiri"].map((t) => (
            <li key={t} className="flex items-center gap-2 font-medium text-good"><Icon name="check" size={16} />{t}</li>
          ))}
        </ul>
        <Button type="submit" disabled={pending} className="justify-self-start">Simpan</Button>
      </form>
    </Card>
  );
}

function PartnersTab() {
  const { m, run, pending } = useHr();
  const [form, setForm] = useState({ name: "", focus: "", schedule: "", contact: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const res = await run(() => addPartner(form), "Psikolog mitra ditambahkan");
    if (res.ok) setForm({ name: "", focus: "", schedule: "", contact: "" });
  };
  return (
    <div className="grid items-start gap-[18px] xl:grid-cols-2">
      <Card title="Psikolog mitra" sub="Karyawan menghubungi mitra langsung dari aplikasi. HR hanya melihat jumlah karyawan yang menghubungi per bulan, tanpa nama.">
        {m.ds.partners.length === 0 ? <p className="text-muted">Belum ada mitra. Selama belum ada, aplikasi karyawan menampilkan layanan Healing119 dari Kemenkes.</p> : (
          <ul className="grid gap-2.5">
            {m.ds.partners.map((p) => (
              <li key={p.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-mint text-brand"><Icon name="chat" size={18} /></span>
                <div className="min-w-0"><b>{p.name}</b><small className="block truncate text-muted">{[p.focus, p.schedule].filter(Boolean).join(" · ")}</small></div>
                {m.live && (
                  <button type="button" aria-label={`Hapus ${p.name}`} className="p-1 text-muted hover:text-bad"
                    onClick={() => window.confirm(`Hapus ${p.name} dari daftar mitra?`) && run(() => removePartner(p.id), "Mitra dihapus")}>
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Tambah mitra">
        <form onSubmit={add} className="grid gap-2.5">
          <label className="grid gap-1"><span className={labelClass}>Nama psikolog atau layanan</span><input required className={inputClass} value={form.name} onChange={set("name")} placeholder="Nama, M.Psi., Psikolog" /></label>
          <label className="grid gap-1"><span className={labelClass}>Keahlian</span><input className={inputClass} value={form.focus} onChange={set("focus")} placeholder="Stres kerja, kecemasan" /></label>
          <label className="grid gap-1"><span className={labelClass}>Jadwal</span><input className={inputClass} value={form.schedule} onChange={set("schedule")} placeholder="Sen-Jum, 18.00-21.00" /></label>
          <label className="grid gap-1"><span className={labelClass}>Kontak untuk karyawan</span><input required className={inputClass} value={form.contact} onChange={set("contact")} placeholder="Tautan booking, nomor WhatsApp, atau email" /></label>
          <Fine>Karyawan menghubungi mitra langsung lewat kontak ini. Percakapan dan jadwal sesi tidak melewati Sikutaki.</Fine>
          <Button type="submit" disabled={pending} className="justify-self-start"><Icon name="plus" size={15} />Tambah mitra</Button>
        </form>
      </Card>
    </div>
  );
}
