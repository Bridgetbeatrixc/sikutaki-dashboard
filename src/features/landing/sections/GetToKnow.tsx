/* eslint-disable @next/next/no-img-element */
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/paths";
import { PhoneMock } from "../components/PhoneMock";
import { ScaleBar } from "../components/ScaleBar";
import { Card, container } from "../components/ui";
import { KNOW_POINTS } from "../content";

const WEEK_CHANGES: [string, number][] = [["Insomnia", -6], ["Minder", -3], ["Galau", 2]];

/** On phones the floating cards stack under the phone instead of overlapping it. */
const floating = "z-[2] w-full max-w-[320px] sm:absolute";

export function GetToKnow() {
  return (
    <section className={`${container} grid items-center gap-10 pt-[70px] pb-[50px] sm:pt-[110px] sm:pb-[90px] lg:grid-cols-[0.8fr_1.2fr]`}>
      <div>
        <h2 className="mb-[26px] text-[clamp(34px,4vw,52px)] font-light">Kenali Sikutaki</h2>
        <ul className="grid gap-3.5 text-[17px]">
          {KNOW_POINTS.map((p) => (
            <li key={p} className="flex items-center gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-2 text-white"><Icon name="check" size={16} /></span>{p}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-col items-center gap-4 sm:min-h-[560px] sm:flex-row sm:justify-center lg:min-h-[680px]">
        <div className="absolute top-1/2 left-1/2 hidden size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_60%_35%,#fff_0%,var(--color-sky)_50%,#c7e1ef_100%)] sm:block" />
        <Card className={cn(floating, "overflow-hidden sm:top-[60px] sm:left-0 sm:w-[190px]")}>
          <img src={asset("/img/float-laptop.jpg")} alt="" className="h-[120px] w-full object-cover" />
          <div className="px-3 py-2.5"><small className="block text-[11.5px] text-muted">Konsultasi online</small><b className="text-[13.5px] font-semibold">Dari rumah, rahasia</b></div>
        </Card>
        <Card className={cn(floating, "grid gap-3.5 px-4 py-3.5 sm:bottom-[70px] sm:left-0 sm:w-[200px]")}>
          <ScaleBar label="Kecemasan" pos={28} value="Rendah" />
          <ScaleBar label="Burnout" pos={71} value="Tinggi" />
        </Card>
        <div className="relative z-[1]"><PhoneMock screen="checkin" /></div>
        <Card className={cn(floating, "grid gap-2 px-4 py-3.5 sm:top-[330px] sm:right-0 sm:w-[180px]")}>
          <small className="text-xs text-muted">Minggu ini vs lalu</small>
          {WEEK_CHANGES.map(([name, d]) => (
            <div key={name} className="flex justify-between text-sm">
              <b className="font-medium">{name}</b>
              <span className={cn("num font-semibold", d < 0 ? "text-brand-2" : "text-[#d0573f]")}>{d > 0 ? `+${d}` : d}</span>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
