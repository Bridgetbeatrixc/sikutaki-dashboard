import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Delta } from "./Delta";

export function Kpi({ label, value, unit, delta, goodWhenUp, foot }: {
  label: string; value: ReactNode; unit?: string; delta?: number; goodWhenUp?: boolean; foot?: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5 rounded-card border border-line bg-white px-3.5 py-3 sm:px-[18px] sm:py-4">
      <span className="text-[12.5px] font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2.5">
        <b className="num text-2xl leading-tight font-bold tracking-tight text-head sm:text-[30px]">
          {value}{unit && <small className="ml-px text-sm font-medium text-muted">{unit}</small>}
        </b>
        {delta !== undefined && <Delta d={delta} goodWhenUp={goodWhenUp} />}
      </div>
      {foot && <span className="text-xs text-muted">{foot}</span>}
    </div>
  );
}

export function KpiGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return <div className={cn("grid grid-cols-2 gap-3.5", cols === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>{children}</div>;
}
