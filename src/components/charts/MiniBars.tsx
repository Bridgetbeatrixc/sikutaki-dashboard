/** Small vertical bars; the latest value is highlighted. */
export function MiniBars({ values, labels, color = "#0A66F5" }: { values: number[]; labels: string[]; color?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-[110px] items-end gap-4 pt-2">
      {values.map((v, i) => (
        <div key={labels[i]} className="grid justify-items-center gap-1">
          <b className="num text-[15px]">{v}</b>
          <span className="block w-[34px] rounded-t-md rounded-b-sm" style={{ height: `${(v / max) * 56}px`, background: i === values.length - 1 ? color : "#CFD8E3" }} />
          <em className="text-[14px] text-muted not-italic">{labels[i]}</em>
        </div>
      ))}
    </div>
  );
}
