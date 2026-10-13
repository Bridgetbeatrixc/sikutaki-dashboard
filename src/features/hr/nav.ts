import type { IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";

export const HR_NAV: { href: string; icon: IconName; label: string }[] = [
  { href: ROUTES.hr.root, icon: "home", label: "Beranda" },
  { href: ROUTES.hr.divisions, icon: "people", label: "Divisi" },
  { href: ROUTES.hr.areas, icon: "grid", label: "17 Area" },
  { href: ROUTES.hr.checkin, icon: "calendar", label: "Check-in" },
  { href: ROUTES.hr.reports, icon: "file", label: "Laporan" },
  { href: ROUTES.hr.settings, icon: "cog", label: "Pengaturan" },
];

/** Index after which the sidebar draws a divider (data pages above, admin pages below). */
export const NAV_DIVIDER_AFTER = 2;

export const isActive = (pathname: string, href: string) => {
  const p = pathname.replace(/\/$/, "");
  return href === ROUTES.hr.root ? p === href : p === href || p.startsWith(`${href}/`);
};
