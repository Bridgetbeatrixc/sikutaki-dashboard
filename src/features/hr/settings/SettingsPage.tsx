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
import type { Dataset } from "@/lib/model";
import { ENERGY_NOTE, PRACTITIONER_CODE, PRACTITIONER_TYPES, practitionerType } from "@/lib/practice";
import { addPartner, addTeam, createResetLink, deleteTeam, reactivatePartner, removePartner, renameTeam, saveEnergySection, savePrivacy, updateCompany, type PartnerInput } from "@/store/hr-actions";
import { useHr } from "../HrProvider";
import { InviteCard } from "../InviteCard";

const TABS = [
  { id: "organisasi", label: "Organisasi" },
  { id: "karyawan", label: "Karyawan" },
  { id: "privasi", label: "Privasi" },
  { id: "mitra", label: "Mitra" },
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
      <EnergyCard />
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

/** Company switch for the Latihan Energi section of the employee app. */
function EnergyCard() {
  const { m, run, pending } = useHr();
  const on = m.COMPANY.energySection;
  return (
    <Card title="Latihan Energi di aplikasi karyawan" sub="Suara mangkuk bernyanyi dan gong, merasakan energi tubuh, dan latihan prana mandiri.">
      <p className="text-[13.5px] leading-normal text-body">
        Bila diizinkan, setiap karyawan tetap memilih sendiri untuk menyalakannya di profil. Setiap latihan diberi label: <i>{ENERGY_NOTE}</i>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", on ? "bg-mint text-brand" : "bg-soft text-muted")}>{on ? "Diizinkan" : "Tidak ditampilkan"}</span>
        <Button size="sm" variant="soft" disabled={pending}
          onClick={() => run(() => saveEnergySection(!on), on ? "Latihan Energi disembunyikan dari aplikasi karyawan" : "Latihan Energi diizinkan")}>
          {on ? "Sembunyikan untuk semua karyawan" : "Izinkan"}
        </Button>
      </div>
    </Card>
  );
}

const EMPTY_PARTNER: PartnerInput = { name: "", focus: "", schedule: "", contact: "", kind: "psikolog", practice: "", credential: "", confirmed: false };

function PartnersTab() {
  const { m, run, pending } = useHr();
  const [form, setForm] = useState(EMPTY_PARTNER);
  const set = (k: "name" | "focus" | "schedule" | "contact" | "practice" | "credential") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const comp = form.kind === "komplementer";
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const res = await run(() => addPartner(form), comp ? "Praktisi komplementer ditambahkan" : "Psikolog mitra ditambahkan");
    if (res.ok) setForm(EMPTY_PARTNER);
  };
  const psych = m.ds.partners.filter((p) => p.kind === "psikolog");
  const compl = m.ds.partners.filter((p) => p.kind === "komplementer");
  const r = m.ds.referrals;
  const complMonth = r.complementary[r.complementary.length - 1] ?? 0;

  return (
    <div className="grid items-start gap-[18px] xl:grid-cols-2">
      <div className="grid min-w-0 gap-[18px]">
        <Card title="Psikolog mitra" sub="Karyawan menghubungi mitra langsung dari aplikasi. HR hanya melihat jumlah karyawan yang menghubungi per bulan, tanpa nama.">
          {psych.length === 0 ? <p className="text-muted">Belum ada psikolog mitra. Selama belum ada, aplikasi karyawan menampilkan layanan Healing119 dari Kemenkes.</p> : (
            <ul className="grid gap-2.5">{psych.map((p) => <PartnerRow key={p.id} p={p} />)}</ul>
          )}
        </Card>
        <Card title="Praktisi komplementer" sub="Bukan dokter atau psikolog. Tampil di aplikasi karyawan di bawah psikolog, dengan label dan kode etik.">
          {compl.length === 0 ? <p className="text-muted">Belum ada praktisi komplementer.</p> : (
            <ul className="grid gap-2.5">{compl.map((p) => <PartnerRow key={p.id} p={p} />)}</ul>
          )}
          <Fine>Bulan ini <b className="num">{complMonth}</b> karyawan menghubungi praktisi komplementer. Hanya jumlah, tanpa nama.</Fine>
        </Card>
      </div>
      <Card title="Tambah mitra">
        <form onSubmit={add} className="grid gap-2.5">
          <div role="radiogroup" aria-label="Jenis mitra" className="grid grid-cols-2 gap-2">
            {([["psikolog", "Psikolog"], ["komplementer", "Praktisi komplementer"]] as const).map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={form.kind === k} onClick={() => setForm({ ...form, kind: k })}
                className={cn("rounded-xl border-[1.5px] px-3 py-2.5 text-[13.5px] font-semibold", form.kind === k ? "border-brand bg-mint text-brand" : "border-line text-body")}>
                {label}
              </button>
            ))}
          </div>
          {comp && (
            <label className="grid gap-1"><span className={labelClass}>Jenis praktik</span>
              <select required className={inputClass} value={form.practice} onChange={set("practice")}>
                <option value="" disabled>Pilih jenis praktik</option>
                {PRACTITIONER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
          )}
          <label className="grid gap-1"><span className={labelClass}>{comp ? "Nama praktisi" : "Nama psikolog atau layanan"}</span><input required className={inputClass} value={form.name} onChange={set("name")} placeholder={comp ? "Nama lengkap" : "Nama, M.Psi., Psikolog"} /></label>
          <label className="grid gap-1"><span className={labelClass}>{comp ? "Yang ditawarkan" : "Keahlian"}</span><input className={inputClass} value={form.focus} onChange={set("focus")} placeholder={comp ? "Kelas chikung untuk relaksasi" : "Stres kerja, kecemasan"} /></label>
          <label className="grid gap-1"><span className={labelClass}>Jadwal</span><input className={inputClass} value={form.schedule} onChange={set("schedule")} placeholder="Sen-Jum, 18.00-21.00" /></label>
          <label className="grid gap-1"><span className={labelClass}>Kontak untuk karyawan</span><input required className={inputClass} value={form.contact} onChange={set("contact")} placeholder="Tautan booking, nomor WhatsApp, atau email" /></label>
          {comp && (
            <>
              <label className="grid gap-1"><span className={labelClass}>Kredensial</span>
                <input required className={inputClass} value={form.credential} onChange={set("credential")} placeholder="Nomor sertifikat, lembaga, atau surat terdaftar" />
                {form.practice && <small className="text-muted">Syarat: {practitionerType(form.practice)?.requirement}.</small>}
              </label>
              <div className="grid gap-1.5 rounded-xl bg-soft p-3 text-[13px]">
                <b>Kode etik praktisi</b>
                <ul className="grid list-disc gap-0.5 pl-5 text-body">{PRACTITIONER_CODE.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
              <label className="flex items-start gap-2 text-[13px] text-body">
                <input type="checkbox" className="mt-0.5 accent-brand" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} />
                Saya sudah memeriksa kredensial ini dan praktisi menyetujui kode etik di atas.
              </label>
            </>
          )}
          <Fine>Karyawan menghubungi mitra langsung lewat kontak ini. Percakapan dan jadwal sesi tidak melewati Sikutaki.</Fine>
          <Button type="submit" disabled={pending || (comp && !form.confirmed)} className="justify-self-start"><Icon name="plus" size={15} />Tambah mitra</Button>
        </form>
      </Card>
    </div>
  );
}

function PartnerRow({ p }: { p: Dataset["partners"][number] }) {
  const { m, run } = useHr();
  const type = practitionerType(p.practice);
  return (
    <li className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-mint text-brand"><Icon name={p.kind === "psikolog" ? "chat" : "lotus"} size={18} /></span>
      <div className="min-w-0">
        <b>{p.name}</b>
        {p.suspended && <span className="ml-2 rounded-full bg-bad-bg px-2 py-0.5 text-[11px] font-bold text-bad">Ditangguhkan</span>}
        <small className="block truncate text-muted">{[type?.label, p.focus, p.schedule].filter(Boolean).join(" · ")}</small>
        {p.kind === "komplementer" && <small className="block truncate text-muted">Kredensial: {p.credential}{p.verifiedBy && `, diperiksa ${p.verifiedBy}`}</small>}
        {p.suspended && (
          <small className="block text-bad">
            {p.reports} laporan dari karyawan. Tidak tampil di aplikasi sampai ditinjau.{" "}
            {m.live && <button type="button" className="font-semibold underline" onClick={() => window.confirm(`Tampilkan lagi ${p.name}? Pastikan laporan sudah ditinjau.`) && run(() => reactivatePartner(p.id), "Praktisi ditampilkan lagi")}>Sudah ditinjau, tampilkan lagi</button>}
          </small>
        )}
      </div>
      {m.live && (
        <button type="button" aria-label={`Hapus ${p.name}`} className="p-1 text-muted hover:text-bad"
          onClick={() => window.confirm(`Hapus ${p.name} dari daftar mitra?`) && run(() => removePartner(p.id), "Mitra dihapus")}>
          <Icon name="trash" size={15} />
        </button>
      )}
    </li>
  );
}
