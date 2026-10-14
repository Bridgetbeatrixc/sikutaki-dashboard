"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/paths";
import { appButton, CheckCircle, Lead, linkText, Screen, Section, Title } from "../components/ui";
import { SLOTS } from "../content";
import { useEmployee } from "../EmployeeProvider";

export function CounselingScreen() {
  const { booked, update } = useEmployee();
  const [slot, setSlot] = useState<string | null>(null);

  return (
    <Screen>
      <Title>Bicara dengan psikolog</Title>
      <Lead>Sesi 50 menit lewat video atau chat. <b>Rahasia:</b> perusahaan hanya tahu jumlah sesi yang dipakai, tanpa nama.</Lead>

      <div className="mt-2.5 flex items-center gap-3 rounded-[18px] bg-soft p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/img/avatar-psikolog.jpg")} alt="" width={56} height={56} className="rounded-full object-cover" />
        <div>
          <b className="block text-[14.5px]">Psikolog mitra Sikutaki</b>
          <small className="mt-0.5 block text-xs text-muted">Stres kerja, burnout, kecemasan · contoh profil</small>
        </div>
      </div>

      {booked ? (
        <div className="mt-3.5 grid grid-cols-[28px_1fr_auto] items-start gap-3 rounded-2xl bg-mint px-3.5 py-3">
          <CheckCircle on />
          <div>
            <b className="block text-[14.5px]">Sesi terjadwal</b>
            <small className="mt-0.5 block text-[12.5px] leading-snug text-body">{booked}. Pengingat dan tautan sesi muncul di aplikasi 15 menit sebelum mulai.</small>
          </div>
          <button type="button" className={cn(linkText, "text-sm")} onClick={() => update({ booked: null })}>Batalkan</button>
        </div>
      ) : (
        <>
          <Section>Pilih jadwal</Section>
          <div className="mb-1.5 grid gap-2">
            {SLOTS.map((s) => (
              <button key={s} type="button" onClick={() => setSlot(s)} aria-pressed={slot === s}
                className={cn("rounded-[14px] border-[1.5px] px-3.5 py-3 text-left text-sm text-ink", slot === s ? "border-app bg-[#eef1f7] font-semibold" : "border-line bg-white")}>
                {s}
              </button>
            ))}
          </div>
          <button type="button" className={appButton()} disabled={!slot} onClick={() => update({ booked: slot })}>
            {slot ? `Pesan sesi ${slot.split(" · ")[0]}` : "Pilih jadwal dulu"}
          </button>
        </>
      )}

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
