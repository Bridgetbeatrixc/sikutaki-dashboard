import { cn } from "@/lib/cn";

/** Pill group for picking one option (or several, when multi is used by the caller). */
export function Pills<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-full border px-3 py-1 text-[15px] font-medium", value === o.value ? "border-brand bg-brand text-white" : "border-line bg-white")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string;
}) {
  return (
    <div className="flex justify-self-start gap-1 rounded-xl bg-track p-1" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-[9px] px-3 py-1.5 font-semibold", value === o.value ? "bg-white text-brand shadow-sm" : "text-muted")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
