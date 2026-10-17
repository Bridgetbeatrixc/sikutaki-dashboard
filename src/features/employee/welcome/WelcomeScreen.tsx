import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { MoodFace } from "../components/MoodFace";
import { appButton, Lead } from "../components/ui";
import { MOODS } from "../content";

const PROMISES: { icon: IconName; title: string; text: string }[] = [
  { icon: "clock", title: "10 detik sehari", text: "Catat mood dan jam tidurmu." },
  { icon: "calendar", title: "3 menit seminggu sekali", text: "Check-in 8 pertanyaan, tutup setiap Minggu." },
  { icon: "lock", title: "Jawabanmu rahasia", text: "HR tidak pernah melihat jawaban per orang, hanya rata-rata divisi minimal 5 orang." },
];

export function WelcomeScreen() {
  return (
    <div className="grid gap-1 px-6 pt-[18px] pb-7">
      <div className="mt-5 mb-1.5 flex items-end justify-center gap-2.5">
        {[MOODS[1], MOODS[3], MOODS[4]].map((m) => (
          <MoodFace key={m.id} mood={m} size={m.id === 4 ? 96 : 70} className="rounded-[20px] shadow-[0_10px_24px_rgba(0,0,0,.14)]" />
        ))}
      </div>
      <h1 className="mt-3.5 mb-1.5 text-center text-[28px] font-semibold text-ink">Ruang aman untuk cek kondisimu</h1>
      <Lead className="text-center">Sikutaki membantumu memperhatikan mood, tidur, dan tingkat stres, lalu memberi latihan yang cocok.</Lead>
      <ul className="mt-4 mb-2.5 grid gap-2.5">
        {PROMISES.map((p) => (
          <li key={p.title} className="grid grid-cols-[36px_1fr] items-start gap-3 rounded-2xl bg-soft p-3">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-app"><Icon name={p.icon} size={18} /></span>
            <div>
              <b className="block text-sm">{p.title}</b>
              <small className="mt-px block text-[12.5px] leading-snug text-muted">{p.text}</small>
            </div>
          </li>
        ))}
      </ul>
      <Link href={ROUTES.employee.home} className={appButton()}>Mulai</Link>
    </div>
  );
}
