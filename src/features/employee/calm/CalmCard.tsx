import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";

/** Entry point to the calm-down tool, kept one tap away on Beranda and Latihan. */
export function CalmCard({ className }: { className?: string }) {
  return (
    <Link href={ROUTES.employee.calm}
      className={cn("grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[18px] bg-[linear-gradient(135deg,#0a66f5,#3b8ef7)] py-2.5 pr-3 pl-2.5 text-white shadow-[0_10px_24px_rgba(10,102,245,.28)]", className)}>
      <span className="grid size-11 place-items-center rounded-[14px] bg-white/20">
        <Icon name="lotus" size={24} />
      </span>
      <span>
        <b className="block text-[14px] font-semibold">Lagi cemas atau panik?</b>
        <small className="mt-0.5 block text-[12px] text-white/85">Latihan napas terpandu, langsung mulai</small>
      </span>
      <Icon name="chevron" size={18} />
    </Link>
  );
}
