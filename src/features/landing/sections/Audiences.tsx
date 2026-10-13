/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { asset, ROUTES } from "@/lib/paths";
import { container } from "../components/ui";

const AUDIENCES: { img: string; icon: IconName; title: string; text: string; href: string; cta: string }[] = [
  { img: "card-hr.jpg", icon: "people", title: "Untuk HR", text: "Lihat kondisi tim tanpa membuka data pribadi.", href: ROUTES.hr.root, cta: "Buka dashboard HR" },
  { img: "card-karyawan.jpg", icon: "user", title: "Untuk karyawan", text: "Kenali diri sendiri dalam 3 menit seminggu.", href: ROUTES.employee.root, cta: "Coba aplikasi karyawan" },
  { img: "card-psikolog.jpg", icon: "chat", title: "Untuk psikolog mitra", text: "Terima rujukan yang sudah tersaring.", href: "#demo", cta: "Hubungi kami" },
];

export function Audiences() {
  return (
    <section className={`${container} relative z-[2] grid gap-5 sm:grid-cols-3`}>
      {AUDIENCES.map((a) => (
        <Link key={a.title} href={a.href}
          className="grid gap-1.5 overflow-hidden rounded-[20px] bg-white px-6 pb-6 shadow-[0_10px_30px_rgba(14,42,35,.08)] transition-transform hover:-translate-y-[3px]">
          <img src={asset(`/img/${a.img}`)} alt="" className="-mx-6 mb-[18px] h-[190px] w-[calc(100%+48px)] max-w-none object-cover" />
          <span className="relative -mt-11 mb-2 inline-flex size-11 items-center justify-center rounded-xl border-3 border-white bg-mint text-brand">
            <Icon name={a.icon} size={22} />
          </span>
          <b className="text-[19px] font-semibold text-head">{a.title}</b>
          <small className="text-[14.5px] text-muted">{a.text}</small>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">{a.cta} <Icon name="arrow" size={14} /></span>
        </Link>
      ))}
    </section>
  );
}
