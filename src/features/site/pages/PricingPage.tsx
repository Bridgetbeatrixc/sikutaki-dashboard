import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/paths";
import { pillButton } from "@/features/landing/components/ui";
import { Band, BandHead, CtaBand, PageHero, Notice } from "../ui";

const PLANS = [
  {
    name: "Pilot", tag: "Mulai di sini", price: "3 bulan, satu tim",
    text: "Untuk mencoba Sikutaki bersama satu tim sebelum memutuskan.",
    features: ["Satu divisi, minimal 5 orang", "Check-in mingguan selama 12 minggu", "Dashboard HR dan aplikasi karyawan", "Laporan hasil yang terbuka di akhir"],
    cta: "Ajukan pilot", href: ROUTES.contact, featured: true,
  },
  {
    name: "Tim", tag: "Setelah pilot", price: "Per karyawan per bulan",
    text: "Untuk perusahaan yang ingin memantau beberapa divisi setiap minggu.",
    features: ["Semua divisi yang berisi minimal 5 orang", "42 area dan tren 12 minggu", "Catatan tindak lanjut HR", "Rujukan rahasia ke psikolog mitra"],
    cta: "Bicara dengan kami", href: ROUTES.contact, featured: false,
  },
  {
    name: "Perusahaan", tag: "Skala besar", price: "Sesuai kebutuhan",
    text: "Untuk organisasi besar dengan kebutuhan keamanan dan integrasi khusus.",
    features: ["Login lewat akun kantor", "Pengaturan data dan retensi", "Pendampingan peluncuran", "Laporan untuk manajemen"],
    cta: "Hubungi tim kami", href: ROUTES.contact, featured: false,
  },
];

const FAQ = [
  { q: "Berapa harganya?", a: "Harga per karyawan per bulan akan kami tetapkan setelah pilot pertama selesai. Untuk sekarang, kami membahasnya langsung saat demo." },
  { q: "Apakah karyawan perlu instal aplikasi?", a: "Tidak. Check-in dibuka lewat browser di ponsel, dan hanya butuh sekitar 3 menit seminggu." },
  { q: "Apa yang dilihat HR?", a: "Rata-rata per divisi untuk tim dengan minimal 5 orang. HR tidak pernah melihat jawaban perorangan." },
  { q: "Bagaimana kalau tim kami kurang dari 5 orang?", a: "Datanya disembunyikan sampai ada minimal 5 orang yang mengisi, supaya tidak ada yang bisa dikenali." },
];

export function PricingPage() {
  return (
    <>
      <PageHero icon="spark" eyebrow="Harga" title="Mulai kecil. Lihat hasilnya dulu."
        text="Setiap kerja sama dimulai dengan pilot 3 bulan bersama satu tim, lalu laporan hasil yang terbuka.">
        <Notice className="mt-2">Harga final belum ditetapkan. Paket di bawah adalah rencana yang kami bahas bersama perusahaan pilot.</Notice>
      </PageHero>

      <Band tone="grey">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={cn("grid content-start gap-6 rounded-[32px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,.04)] sm:p-9", p.featured && "ring-2 ring-brand")}>
              <div className="grid gap-1.5">
                <span className={cn("text-[13px] font-semibold", p.featured ? "text-brand" : "text-muted")}>{p.tag}</span>
                <h2 className="text-[32px] font-semibold tracking-[-0.03em]">{p.name}</h2>
                <b className="text-[17px] font-medium text-ink">{p.price}</b>
                <p className="text-[15px] text-muted">{p.text}</p>
              </div>
              <ul className="grid gap-2.5 border-t border-line pt-5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-body">
                    <Icon name="check" size={18} stroke={2.2} className="mt-0.5 shrink-0 text-brand" />{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={cn(pillButton(p.featured ? "primary" : "white"), "justify-self-start", !p.featured && "ring-1 ring-line")}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </Band>

      <Band>
        <BandHead eyebrow="FAQ" title="Pertanyaan yang sering diajukan." />
        <div className="mx-auto grid max-w-[760px] divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-ink">
                {f.q}<Icon name="plus" size={18} className="shrink-0 text-muted transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Band>

      <CtaBand title="Siap mencoba dengan satu tim?" text="Ceritakan tim Anda, dan kami siapkan pilotnya."
        primary={{ label: "Ajukan pilot", href: ROUTES.contact }} secondary={{ label: "Coba dashboard HR", href: ROUTES.demo.hr }} />
    </>
  );
}
