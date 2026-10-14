import { ROUTES } from "@/lib/paths";

/* Links shared by the site header and footer. Home sections use "/#id" so they work from every page. */

export type NavLink = { label: string; href: string };

export const MAIN_NAV: NavLink[] = [
  { label: "Produk", href: "/#dashboard" },
  { label: "17 Area", href: "/#area" },
  { label: "Harga", href: ROUTES.pricing },
  { label: "Keamanan", href: ROUTES.security },
  { label: "Tentang kami", href: ROUTES.about },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  { title: "Produk", links: [
    { label: "Dashboard HR", href: ROUTES.hr.root },
    { label: "Aplikasi karyawan", href: ROUTES.employee.root },
    { label: "17 Area", href: "/#area" },
    { label: "Harga", href: ROUTES.pricing },
  ] },
  { title: "Perusahaan", links: [
    { label: "Tentang kami", href: ROUTES.about },
    { label: "Keamanan dan privasi", href: ROUTES.security },
    { label: "Kontak", href: ROUTES.contact },
  ] },
  { title: "Akun", links: [
    { label: "Masuk", href: ROUTES.login },
    { label: "Daftar", href: ROUTES.signup },
  ] },
  { title: "Legal", links: [
    { label: "Kebijakan privasi", href: ROUTES.privacy },
    { label: "Syarat dan ketentuan", href: ROUTES.terms },
  ] },
];

/** True when a header link points at the current page (section links never count as active). */
export const isCurrent = (pathname: string, href: string) =>
  !href.includes("#") && pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
