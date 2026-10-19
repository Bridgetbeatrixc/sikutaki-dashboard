"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Fine } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { regenerateInvite } from "@/server/actions/hr";
import { useHr } from "./HrProvider";

/** The company's invite code and link: employees join with it and pick their division. */
export function InviteCard({ className }: { className?: string }) {
  const { m, run, toast } = useHr();
  const code = m.COMPANY.inviteCode;
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}${ROUTES.join(code)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast("Tautan undangan disalin");
    } catch {
      toast("Salin tautan secara manual dari kotak di atas");
    }
  };
  const renew = () => {
    if (window.confirm("Buat kode baru? Kode lama langsung tidak berlaku. Karyawan yang sudah bergabung tidak terpengaruh.")) {
      run(regenerateInvite, "Kode undangan baru dibuat");
    }
  };

  return (
    <Card title="Undang karyawan" sub="Bagikan tautan ini lewat email atau grup chat kantor. Karyawan membuat akun sendiri dan memilih divisinya." className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-muted">Kode undangan</span>
        <b className="num rounded-[10px] bg-mint px-3 py-1.5 text-lg tracking-[0.18em] text-brand">{code}</b>
      </div>
      <div className="flex flex-wrap gap-2">
        <input readOnly value={link} aria-label="Tautan undangan" className={cn(inputClass, "min-w-0 flex-1 text-[13px]")} onFocus={(e) => e.currentTarget.select()} />
        <Button onClick={copy}><Icon name="copy" size={15} />Salin tautan</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Fine>HR hanya melihat jumlah karyawan per divisi, tidak pernah siapa yang sudah mengisi check-in.</Fine>
        <Button variant="link" onClick={renew}>Buat kode baru</Button>
      </div>
    </Card>
  );
}
