/** Low-to-high gradient band with a marker. */
export function ScaleBar({ label, pos, value }: { label: string; pos: number; value: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-[13px]"><span>{label}</span><b className="font-semibold text-head">{value}</b></div>
      <div className="relative h-2.5 rounded-full bg-[linear-gradient(90deg,#8facd3,#f3d27a,#f4a26b,#e25e48)]">
        <i className="absolute -top-1 -ml-[9px] size-[18px] rounded-full border-3 border-ink bg-white" style={{ left: `${pos}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[10.5px] text-muted"><span>Rendah</span><span>Sedang</span><span>Tinggi</span></div>
    </div>
  );
}
