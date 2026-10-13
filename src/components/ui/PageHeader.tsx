import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, sub, crumbs, action }: {
  title: string; sub?: ReactNode; crumbs?: { label: string; href: string }[]; action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-1 flex gap-1.5 text-[13px] text-muted">
            {crumbs.map((c) => <Link key={c.href} href={c.href} className="font-semibold text-brand hover:underline">{c.label}</Link>)}
            <span>/</span>
          </nav>
        )}
        <h1 className="text-[22px] font-bold sm:text-[26px]">{title}</h1>
        {sub && <div className="mt-1 flex flex-wrap items-center gap-1 text-muted">{sub}</div>}
      </div>
      {action}
    </div>
  );
}
