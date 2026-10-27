/** Share of respondents per level, as one stacked bar with a legend. */
export function SeverityBar({ rendah, sedang, tinggi }: { rendah: number; sedang: number; tinggi: number }) {
  const segs = [
    { k: "Rendah", v: rendah, c: "#F6D9CF" },
    { k: "Sedang", v: sedang, c: "#E08A6F" },
    { k: "Tinggi", v: tinggi, c: "#B03424" },
  ];
  return (
    <div>
      <div className="flex h-[22px] gap-0.5 overflow-hidden rounded-lg">
        {segs.map((s) => <span key={s.k} className="block h-full" style={{ width: `${s.v}%`, background: s.c }} title={`${s.k}: ${s.v}%`} />)}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-4 text-[15px] text-muted">
        {segs.map((s) => (
          <span key={s.k} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: s.c }} />{s.k} <b className="num text-ink">{s.v}%</b></span>
        ))}
      </div>
    </div>
  );
}
