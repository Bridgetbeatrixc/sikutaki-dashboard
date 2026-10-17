import { Fragment } from "react";
import { HEAT, HEAT_AREAS, HEAT_TEAMS } from "../content";

/** Green (sehat) to amber to coral (perlu perhatian). */
const cellColor = (v: number) => {
  if (v < 35) return `rgba(59,142,247,${0.18 + v / 140})`;
  if (v < 60) return `rgba(227,155,59,${0.25 + (v - 35) / 90})`;
  return `rgba(226,94,72,${0.45 + (v - 60) / 80})`;
};

export function Heatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[560px] gap-1" style={{ gridTemplateColumns: `92px repeat(${HEAT_AREAS.length}, minmax(22px, 1fr))` }}>
        <span />
        {HEAT_AREAS.map((a) => (
          <span key={a.name} title={a.name}
            className="flex h-[92px] rotate-180 items-center gap-1 justify-self-center text-[10.5px] whitespace-nowrap text-muted [writing-mode:vertical-rl]">
            <i className="size-1.5 shrink-0 rounded-full" style={{ background: a.color }} />{a.name}
          </span>
        ))}
        {HEAT_TEAMS.map((team, ti) => (
          <Fragment key={team}>
            <span className="self-center text-xs font-medium">{team}</span>
            {HEAT[ti].map((v, ai) => (
              <span key={ai} className="h-[26px] rounded-md" style={{ background: cellColor(v) }} title={`${team} · ${HEAT_AREAS[ai].name}: ${v}`} />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted">
        <span>Sehat</span>
        <i className="h-2 w-[120px] rounded-full bg-[linear-gradient(90deg,rgba(59,142,247,.35),rgba(227,155,59,.6),rgba(226,94,72,.9))]" />
        <span>Perlu perhatian</span>
      </div>
    </div>
  );
}
