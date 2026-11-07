import { cn } from "@/lib/cn";

/** "Powered by SIKUTAKI": Teduh Jiwa is a product of SIKUTAKI. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn("text-[12.5px] text-muted", className)}>
      Powered by <b className="font-semibold tracking-[0.04em] text-ink">SIKUTAKI</b>
    </p>
  );
}
