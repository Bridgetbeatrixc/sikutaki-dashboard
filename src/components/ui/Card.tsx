import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ title, sub, action, children, className, flush = false }: {
  title?: ReactNode; sub?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean;
}) {
  return (
    <section className={cn("grid min-w-0 content-start gap-3.5 rounded-card border border-line bg-white", flush ? "overflow-hidden" : "p-3.5 sm:px-5 sm:py-[18px]", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-[17.5px] font-bold text-ink">{title}</h3>}
            {sub && <p className="mt-0.5 text-[15px] text-muted">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Small grey footnote under a card or page. */
export function Fine({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[14px] text-muted", className)}>{children}</p>;
}
