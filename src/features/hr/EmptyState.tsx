"use client";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { useHr } from "./HrProvider";

/** Shown on data pages while the company has no check-in results yet. */
export function EmptyState() {
  const { m } = useHr();
  return (
    <div className="mx-auto my-[8vh] grid max-w-[520px] justify-items-center gap-3 text-center">
      <span className="grid size-[60px] place-items-center rounded-[18px] bg-mint text-brand"><Icon name="calendar" size={26} /></span>
      <h1 className="text-2xl font-bold">Halaman ini muncul setelah check-in pertama</h1>
      <p className="leading-relaxed text-muted">
        Sikutaki baru menampilkan angka bila minimal {m.MIN_GROUP} karyawan mengisi check-in dalam satu minggu. Saat ini {m.COMPANY.employees} karyawan sudah bergabung.
      </p>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
        <ButtonLink href={ROUTES.hr.root}>Lihat langkah awal</ButtonLink>
        <ButtonLink href={ROUTES.hr.checkin} variant="soft">Jadwal check-in</ButtonLink>
      </div>
    </div>
  );
}
