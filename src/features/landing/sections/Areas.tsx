import type { CSSProperties } from "react";
import { container, SectionHead } from "../components/ui";
import { AREA_GROUPS } from "../content";

export function Areas() {
  return (
    <section id="area" className="py-20">
      <div className={container}>
        <SectionHead title="17 area yang dipantau" text="Dikelompokkan supaya mudah dibaca, oleh karyawan maupun HR." />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {AREA_GROUPS.map((g) => (
            <div key={g.id} style={{ "--c": g.color } as CSSProperties}
              className="flex flex-row flex-wrap gap-2 rounded-[20px] bg-[color-mix(in_srgb,var(--c)_7%,#fff)] p-5 sm:flex-col sm:flex-nowrap">
              <div className="mb-1.5 flex basis-full items-center justify-between sm:basis-auto">
                <b className="text-base font-semibold text-(--c)">{g.name}</b>
                <span className="rounded-full bg-(--c) px-[9px] py-px font-mono text-xs text-white">{g.areas.length}</span>
              </div>
              {g.areas.map((a) => (
                <span key={a} className="rounded-xl border-l-3 border-(--c) bg-white px-[11px] py-2 text-sm font-medium shadow-[0_1px_0_color-mix(in_srgb,var(--c)_18%,transparent)] sm:px-3 sm:py-2.5 sm:text-[15px]">
                  {a}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
