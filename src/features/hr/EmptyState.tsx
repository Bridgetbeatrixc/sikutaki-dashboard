"use client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/paths";
import { useHr } from "./HrProvider";

/** Shown on data pages while the organisation has no check-in results yet. */
export function EmptyState() {
  const { setEmpty } = useHr();
  return (
    <div className="mx-auto my-[8vh] grid max-w-[520px] justify-items-center gap-3 text-center">
      <span className="grid size-[60px] place-items-center rounded-[18px] bg-mint text-brand"><Icon name="calendar" size={26} /></span>
      <h1 className="text-2xl font-bold">Halaman ini muncul setelah check-in pertama</h1>
      <p className="leading-relaxed text-muted">Sikutaki baru menampilkan angka bila sebuah divisi punya minimal 5 penjawab. Atur jadwal check-in dulu, lalu hasil pertama tampil Senin setelah check-in ditutup.</p>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
        <ButtonLink href={ROUTES.hr.checkin}>Atur jadwal check-in</ButtonLink>
        <Button variant="soft" onClick={() => setEmpty(false)}>Lihat contoh data</Button>
      </div>
    </div>
  );
}
