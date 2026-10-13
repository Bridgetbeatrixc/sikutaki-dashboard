import type { InputHTMLAttributes, ReactNode } from "react";

/** A labelled on/off switch row built on a native checkbox. */
export function SwitchRow({ label, hint, ...input }: { label: ReactNode; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center justify-between gap-4 border-t border-line py-2.5" htmlFor={input.id}>
      <span><b className="font-semibold">{label}</b>{hint && <small className="block text-muted">{hint}</small>}</span>
      <input type="checkbox" {...input}
        className="relative h-6 w-[42px] shrink-0 cursor-pointer appearance-none rounded-full bg-[#cfdcd6] transition-colors checked:bg-brand-2 after:absolute after:top-[3px] after:left-[3px] after:size-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] checked:after:translate-x-[18px]" />
    </label>
  );
}
