import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ROUTES } from "@/lib/paths";
import { pillButton, textLink } from "@/features/landing/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 text-center">
      <div className="grid justify-items-center gap-5">
        <Logo size={40} label={false} />
        <h1 className="text-[clamp(36px,6vw,64px)] font-semibold">Halaman tidak ditemukan.</h1>
        <p className="max-w-[460px] text-[17px] text-muted">Alamatnya mungkin salah ketik, atau halaman ini sudah dipindahkan.</p>
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
          <Link href={ROUTES.home} className={pillButton("primary", true)}>Ke beranda</Link>
          <Link href={ROUTES.contact} className={`${textLink} text-[17px]`}>Hubungi kami</Link>
        </div>
      </div>
    </div>
  );
}
