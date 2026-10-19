"use client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { recordReferral } from "@/server/actions/employee";
import { appButton, Lead, Note, Screen, Section, Title } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

const contactLabel = (contact: string) =>
  contact.startsWith("mailto:") ? "Kirim email" : contact.includes("wa.me/") ? "Chat WhatsApp" : "Buka jadwal";

export function CounselingScreen() {
  const { partners, live, company } = useEmployee();

  return (
    <Screen>
      <Title>Bicara dengan psikolog</Title>
      <Lead>
        Hubungi psikolog mitra {company.name} langsung. <b>Rahasia:</b> percakapan dan jadwal sesi tidak melewati Sikutaki, dan HR hanya melihat jumlah karyawan yang menghubungi mitra setiap bulan, tanpa nama.
      </Lead>

      <Section>Psikolog mitra</Section>
      {partners.length === 0 ? (
        <div className="rounded-2xl bg-soft p-3.5 text-[13.5px] leading-normal text-body">
          Perusahaanmu belum menambahkan psikolog mitra. Untuk sekarang, kamu bisa memakai layanan gratis Healing119 dari Kemenkes di bawah.
        </div>
      ) : (
        <ul className="grid gap-2.5">
          {partners.map((p) => (
            <li key={p.id} className="grid gap-2.5 rounded-[18px] bg-soft p-3.5">
              <div className="grid grid-cols-[44px_1fr] items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white text-app"><Icon name="chat" size={20} /></span>
                <div className="min-w-0">
                  <b className="block text-[14.5px]">{p.name}</b>
                  <small className="mt-0.5 block text-xs text-muted">{[p.focus, p.schedule].filter(Boolean).join(" · ")}</small>
                </div>
              </div>
              {p.contact ? (
                <a href={p.contact} target="_blank" rel="noopener noreferrer" onClick={() => { if (live) void recordReferral(p.id); }}
                  className={appButton("primary", true, "mt-0")}>
                  {contactLabel(p.contact)}
                </a>
              ) : (
                <span className={cn(appButton("ghost", true, "mt-0"), "cursor-default")}>Kontak diatur oleh HR perusahaan</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <Note>Sesi dengan psikolog bersifat rahasia.</Note>

      <div className="mt-[18px] grid gap-1 rounded-2xl bg-[#fdf0f2] px-3.5 py-3 text-[13px] leading-normal text-[#6b2b39]">
        <b>Butuh bantuan sekarang?</b>
        <span>
          Layanan dukungan psikologis Kemenkes (Healing119): telepon 119 ekstensi 8 atau buka{" "}
          <a href="https://healing119.id" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">healing119.id</a>.
          Dalam keadaan darurat, hubungi 112.
        </span>
      </div>
    </Screen>
  );
}
