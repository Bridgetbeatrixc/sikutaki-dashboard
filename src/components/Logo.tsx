import Link from "next/link";
import { asset, ROUTES } from "@/lib/paths";
import { cn } from "@/lib/cn";

export function Logo({ size = 30, label = true, className }: { size?: number; label?: boolean; className?: string }) {
  return (
    <Link href={ROUTES.home} className={cn("inline-flex items-center gap-2.5 font-bold text-head", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/logo.svg")} alt="" width={size} height={size} />
      {label && <span>Sikutaki</span>}
    </Link>
  );
}
