import Link from "next/link";
import { asset, ROUTES } from "@/lib/paths";
import { cn } from "@/lib/cn";

export function Logo({ size = 30, label = true, className, href = ROUTES.home }: { size?: number; label?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold tracking-[-0.02em] text-ink", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/logo.png")} alt="" width={size} height={size} />
      {label && (
        <span className="grid leading-none">
          <span>Teduh Jiwa</span>
          <small className="mt-[3px] text-[0.5em] font-medium tracking-normal text-muted">powered by <b className="font-semibold tracking-[0.04em]">SIKUTAKI</b></small>
        </span>
      )}
    </Link>
  );
}
