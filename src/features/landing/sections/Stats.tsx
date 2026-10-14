import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { container, Ref, SectionHead } from "../components/ui";
import { STATS } from "../content";

export function Stats() {
  return (
    <section className={`${container} pt-[60px] pb-20`}>
      <SectionHead title="Masalah yang nyata, biaya yang nyata" />
      <div className="grid gap-[22px] sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.value} className="grid content-start justify-items-center gap-2.5 rounded-[20px] bg-white px-[26px] py-8 text-center shadow-[0_10px_34px_rgba(0,0,0,.07)]">
            <span className={cn("mb-2 grid size-[132px] place-items-center rounded-full text-white", s.halo)}><Icon name={s.icon} size={30} /></span>
            <b className="text-[40px] leading-tight font-medium tracking-tight text-head">{s.value}</b>
            <small className="max-w-[260px] text-[15px] text-muted">{s.text} <Ref n={s.source} /></small>
          </div>
        ))}
      </div>
    </section>
  );
}
