"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { logout } from "@/store/account";
import { currentAccount } from "@/store/cloud";
import { ENERGY_NOTE } from "@/lib/practice";
import { deleteAccount } from "@/store/employee-actions";
import { ROUTES } from "@/lib/paths";
import { appButton, Lead, Note, Screen, Section, Title } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

const input = "w-full rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[17.5px] text-ink focus:border-app focus:outline-none";
const label = "grid gap-1.5 text-[15.5px] font-semibold text-body";

/** The employee's account: name, division, password, sign out, and deleting the account with all its data. */
export function ProfileScreen() {
  const { user, teams, company, toast, updateUser } = useEmployee();
  const cloud = Boolean(currentAccount());
  const [name, setName] = useState(user.name);
  const [team, setTeam] = useState(user.teamId ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const guard = async (key: string, call: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    setBusy(key);
    try {
      const res = await call();
      if (!res.ok) { toast(res.error ?? "Gagal menyimpan."); return false; }
      toast(done);
      return true;
    } catch {
      toast("Gagal tersambung ke server. Coba lagi.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy("profile");
    if (await updateUser(name, team)) toast("Profil disimpan");
    setBusy(null);
  };
  const remove = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm(cloud ? "Hapus akun beserta semua catatan harian, check-in, program, dan jurnal? Ini tidak bisa dibatalkan." : "Hapus semua catatan harian, check-in, program, dan jurnal di peramban ini? Ini tidak bisa dibatalkan.")) return;
    if (await guard("delete", deleteAccount, "Data dihapus")) window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${cloud ? `${ROUTES.login}?hapus=1` : ROUTES.join()}`);
  };

  return (
    <Screen className="md:mx-auto md:w-full md:max-w-[760px]">
      <Title>Profil</Title>
      <Lead>{user.email} · {company.name}</Lead>

      <Section>Data diri</Section>
      <form onSubmit={saveProfile} className="grid gap-3">
        <label className={label}>Nama panggilan<input className={input} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></label>
        <label className={label}>Divisi
          <select className={input} value={team} onChange={(e) => setTeam(e.target.value)} required>
            <option value="" disabled>Pilih divisi</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <Note>Divisi menentukan rata-rata kelompok mana yang memuat jawabanmu. HR tidak pernah melihat jawaban per orang.</Note>
        <button type="submit" disabled={busy === "profile"} className={appButton("primary", true)}>Simpan</button>
      </form>

      <EnergySetting />

      <form action={logout} className="mt-6">
        <button type="submit" className={cn(appButton("ghost"), "flex items-center justify-center gap-2")}><Icon name="logout" size={18} />Keluar</button>
      </form>

      <details className="mt-6 rounded-2xl border border-[#f1c9c9] p-3.5">
        <summary className="cursor-pointer text-[16px] font-semibold text-bad">{cloud ? "Hapus akun dan semua data" : "Hapus semua data di peramban ini"}</summary>
        <form onSubmit={remove} className="mt-3 grid gap-3">
          <p className="text-[15.5px] leading-normal text-body">{cloud
            ? "Akunmu, catatan harian, check-in, program, permintaan konseling, dan jurnal dihapus permanen dari server dan peramban ini."
            : "Di mode demo semua datamu hanya tersimpan di peramban ini. Catatan harian, check-in, program, dan jurnal dihapus permanen."}</p>
          <button type="submit" disabled={busy === "delete"} className="rounded-2xl bg-bad p-3 text-[16px] font-semibold text-white disabled:opacity-50">{cloud ? "Hapus akun saya" : "Hapus data saya"}</button>
        </form>
      </details>
    </Screen>
  );
}

/** Turns the optional Latihan Energi section on or off, when the company allows it. */
function EnergySetting() {
  const { energy, setEnergyOptIn, toast } = useEmployee();
  const [busy, setBusy] = useState(false);
  if (!energy.allowed) return null;
  const flip = async () => {
    setBusy(true);
    if (await setEnergyOptIn(!energy.optIn)) toast(energy.optIn ? "Latihan Energi disembunyikan" : "Latihan Energi ditampilkan");
    setBusy(false);
  };
  return (
    <>
      <Section>Laporan pribadi</Section>
      <Link href={ROUTES.employee.report} className="flex items-center gap-3 rounded-2xl bg-soft p-3.5 text-ink">
        <Icon name="file" size={18} className="text-app" />
        <span className="flex-1 text-[16px]"><b>Unduh laporanmu (PDF)</b><small className="block text-[14px] text-muted">Mood, tidur, check-in, latihan, dan program. Hanya untukmu.</small></span>
        <Icon name="chevron" size={16} className="text-muted" />
      </Link>
      <Section>Latihan Energi</Section>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-soft p-3.5">
        <p className="text-[15.5px] leading-normal text-body">Tampilkan suara mangkuk dan gong, merasakan energi tubuh, dan latihan prana di halaman Latihan. {ENERGY_NOTE}</p>
        <button type="button" role="switch" aria-checked={energy.optIn} aria-label="Tampilkan Latihan Energi" disabled={busy} onClick={flip}
          className={cn("relative h-7 w-12 rounded-full transition-colors", energy.optIn ? "bg-app" : "bg-[#c3cbd6]")}>
          <i className={cn("absolute top-1 size-5 rounded-full bg-white transition-[left]", energy.optIn ? "left-6" : "left-1")} />
        </button>
      </div>
    </>
  );
}
