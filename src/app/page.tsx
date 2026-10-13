import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";

const ENTRIES: { href: string; icon: IconName; title: string; who: string; points: string[] }[] = [
  {
    href: ROUTES.hr.root, icon: "grid", title: "Dashboard HR", who: "Untuk tim HR",
    points: ["Metrik wellbeing, mood, tidur, dan partisipasi", "Fokus dan penyebab per divisi", "Catatan HR dan laporan bulanan"],
  },
  {
    href: ROUTES.employee.root, icon: "user", title: "Aplikasi karyawan", who: "Untuk karyawan",
    points: ["Catat mood harian dalam 10 detik", "Check-in mingguan 3 menit", "Insight pribadi, latihan, dan konseling"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_700px_at_15%_10%,#ddf1e7,transparent_60%),radial-gradient(900px_600px_at_90%_90%,#eef3df,transparent_60%)] px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-10">
        <header className="grid justify-items-start gap-4">
          <Logo size={36} className="text-xl" />
          <h1 className="max-w-2xl text-3xl font-bold sm:text-[40px]">Kesehatan mental karyawan, terukur tanpa mengorbankan privasi</h1>
          <p className="max-w-xl text-[15px] text-body">Prototipe dengan data contoh. Karyawan mengisi dari aplikasinya, HR hanya melihat rata-rata divisi dengan minimal 5 orang.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {ENTRIES.map((e) => (
            <Link key={e.href} href={e.href} className="group grid gap-4 rounded-[20px] border border-line bg-white p-6 transition-shadow hover:shadow-xl hover:shadow-ink/5">
              <span className="grid size-12 place-items-center rounded-2xl bg-mint text-brand"><Icon name={e.icon} size={22} /></span>
              <div>
                <small className="text-xs font-semibold tracking-wider text-muted uppercase">{e.who}</small>
                <h2 className="text-xl font-bold">{e.title}</h2>
              </div>
              <ul className="grid gap-1.5 text-body">
                {e.points.map((p) => <li key={p} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-brand-2" />{p}</li>)}
              </ul>
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand">Buka <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted">Skor adalah sinyal skrining, bukan diagnosis. Semua angka adalah data contoh.</p>
      </div>
    </main>
  );
}
