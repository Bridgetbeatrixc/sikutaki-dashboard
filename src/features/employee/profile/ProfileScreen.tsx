"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { logout } from "@/server/actions/auth";
import { changePassword, deleteAccount, updateProfile } from "@/server/actions/employee";
import { appButton, Lead, Note, Screen, Section, Title } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

const input = "w-full rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[15px] text-ink focus:border-app focus:outline-none";
const label = "grid gap-1.5 text-[13px] font-semibold text-body";

/** The employee's account: name, division, password, sign out, and deleting the account with all its data. */
export function ProfileScreen() {
  const { user, teams, company, live, toast } = useEmployee();
  const [name, setName] = useState(user.name);
  const [team, setTeam] = useState(user.teamId ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const guard = async (key: string, call: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    if (!live) { toast("Ini demo, perubahan tidak disimpan."); return false; }
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

  const saveProfile = (e: FormEvent) => { e.preventDefault(); guard("profile", () => updateProfile(name, team), "Profil disimpan"); };
  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    if (await guard("password", () => changePassword(String(f.get("current")), String(f.get("next"))), "Kata sandi diganti")) form.reset();
  };
  const remove = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password"));
    if (!window.confirm("Hapus akun beserta semua catatan harian dan check-in-mu? Ini tidak bisa dibatalkan.")) return;
    guard("delete", () => deleteAccount(pw), "Akun dihapus");
  };

  return (
    <Screen>
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

      <Section>Ganti kata sandi</Section>
      <form onSubmit={savePassword} className="grid gap-3">
        <label className={label}>Kata sandi lama<input name="current" type="password" autoComplete="current-password" className={input} required /></label>
        <label className={label}>Kata sandi baru<input name="next" type="password" autoComplete="new-password" minLength={8} className={input} required /></label>
        <button type="submit" disabled={busy === "password"} className={appButton("ghost", true)}>Ganti kata sandi</button>
      </form>

      <form action={logout} className="mt-6">
        <button type="submit" className={cn(appButton("ghost"), "flex items-center justify-center gap-2")}><Icon name="logout" size={18} />Keluar</button>
      </form>

      <details className="mt-6 rounded-2xl border border-[#f1c9c9] p-3.5">
        <summary className="cursor-pointer text-sm font-semibold text-bad">Hapus akun dan semua data</summary>
        <form onSubmit={remove} className="mt-3 grid gap-3">
          <p className="text-[13px] leading-normal text-body">Semua catatan harian, check-in, dan riwayat latihanmu dihapus permanen, termasuk dari rata-rata divisi.</p>
          <label className={label}>Ketik kata sandi untuk konfirmasi<input name="password" type="password" autoComplete="current-password" className={input} required /></label>
          <button type="submit" disabled={busy === "delete"} className="rounded-2xl bg-bad p-3 text-sm font-semibold text-white disabled:opacity-50">Hapus akun saya</button>
        </form>
      </details>
    </Screen>
  );
}
