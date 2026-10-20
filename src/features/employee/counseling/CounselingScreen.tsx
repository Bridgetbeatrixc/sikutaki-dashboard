"use client";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { dangerSigns, lowMoodStreak, PRACTITIONER_CODE, practitionerType, REPORT_REASONS } from "@/lib/practice";
import { addDays } from "@/lib/week";
import { recordReferral } from "@/server/actions/employee";
import { appButton, Lead, Note, Screen, Section, Title } from "../components/ui";
import { useEmployee } from "../EmployeeProvider";

type Partner = ReturnType<typeof useEmployee>["partners"][number];

const contactLabel = (contact: string) =>
  contact.startsWith("mailto:") ? "Kirim email" : contact.includes("wa.me/") ? "Chat WhatsApp" : "Buka jadwal";

export function CounselingScreen() {
  const { partners, company, week, days, today } = useEmployee();
  const psych = partners.filter((p) => p.kind === "psikolog");
  const compl = partners.filter((p) => p.kind === "komplementer");
  // Danger signs in this week's check-in or three heavy days: psychologists and Healing119 come first.
  const urgent = dangerSigns(week.answers) || lowMoodStreak(days, [addDays(today, -2), addDays(today, -1), today]);

  return (
    <Screen>
      <Title>Bicara dengan psikolog</Title>
      <Lead>
        Hubungi mitra {company.name} langsung. <b>Rahasia:</b> percakapan dan jadwal sesi tidak melewati Sikutaki, dan HR hanya melihat jumlah karyawan yang menghubungi mitra setiap bulan, tanpa nama.
      </Lead>
      {urgent && <CrisisBox className="mt-3" />}

      <Section>Psikolog mitra</Section>
      {psych.length === 0 ? (
        <div className="rounded-2xl bg-soft p-3.5 text-[13.5px] leading-normal text-body">
          Perusahaanmu belum menambahkan psikolog mitra. Untuk sekarang, kamu bisa memakai layanan gratis Healing119 dari Kemenkes di bawah.
        </div>
      ) : (
        <ul className="grid gap-2.5">{psych.map((p) => <PartnerCard key={p.id} p={p} />)}</ul>
      )}
      <Note>Sesi dengan psikolog bersifat rahasia.</Note>
      {!urgent && <CrisisBox className="mt-[18px]" />}

      {compl.length > 0 && (
        <section className="mt-2">
          <Section>Praktisi komplementer</Section>
          <p className="-mt-1 mb-2.5 rounded-xl bg-[#fff7ec] px-3 py-2 text-[12.5px] leading-normal text-[#5b4520]">
            <b>Praktisi komplementer, bukan dokter atau psikolog.</b> Untuk relaksasi dan kebiasaan sehat. Bila kamu sedang menjalani perawatan medis atau psikologis, tetap lanjutkan.
          </p>
          <ul className="grid gap-2.5">{compl.map((p) => <PartnerCard key={p.id} p={p} />)}</ul>
          <details className="mt-2.5 rounded-2xl bg-soft p-3.5 text-[13px]">
            <summary className="cursor-pointer font-semibold text-ink">Kode etik praktisi</summary>
            <ul className="mt-2 grid list-disc gap-0.5 pl-5 text-body">{PRACTITIONER_CODE.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="mt-2 text-muted">Bila praktisi melanggar, laporkan lewat tombol di kartunya. Praktisi langsung disembunyikan sampai HR meninjau. Namamu tidak ikut dikirim.</p>
          </details>
        </section>
      )}
    </Screen>
  );
}

function CrisisBox({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-1 rounded-2xl bg-[#fdf0f2] px-3.5 py-3 text-[13px] leading-normal text-[#6b2b39]", className)}>
      <b>Butuh bantuan sekarang?</b>
      <span>
        Layanan dukungan psikologis Kemenkes (Healing119): telepon 119 ekstensi 8 atau buka{" "}
        <a href="https://healing119.id" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">healing119.id</a>.
        Dalam keadaan darurat, hubungi 112.
      </span>
    </div>
  );
}

function PartnerCard({ p }: { p: Partner }) {
  const { live } = useEmployee();
  const comp = p.kind === "komplementer";
  const sub = [comp ? practitionerType(p.practice)?.label : null, p.focus, p.schedule].filter(Boolean).join(" · ");
  return (
    <li className="grid gap-2.5 rounded-[18px] bg-soft p-3.5">
      <div className="grid grid-cols-[44px_1fr] items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-white text-app"><Icon name={comp ? "lotus" : "chat"} size={20} /></span>
        <div className="min-w-0">
          <b className="block text-[14.5px]">{p.name}</b>
          <small className="mt-0.5 block text-xs text-muted">{sub}</small>
        </div>
      </div>
      {p.contact ? (
        <a href={p.contact} target="_blank" rel="noopener noreferrer" onClick={() => { if (live) void recordReferral(p.id); }}
          className={appButton(comp ? "ghost" : "primary", true, "mt-0")}>
          {contactLabel(p.contact)}
        </a>
      ) : (
        <span className={cn(appButton("ghost", true, "mt-0"), "cursor-default")}>Kontak diatur oleh HR perusahaan</span>
      )}
      {comp && <Report partner={p} />}
    </li>
  );
}

/** Reporting a complementary practitioner hides them until HR has reviewed it. */
function Report({ partner }: { partner: Partner }) {
  const { reportPartner, toast } = useEmployee();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async (reason: string) => {
    setBusy(true);
    if (await reportPartner(partner.id, reason)) toast("Laporan terkirim. Praktisi disembunyikan sampai HR meninjau.");
    setBusy(false);
  };
  if (!open) return <button type="button" className="justify-self-start text-xs text-muted underline underline-offset-2" onClick={() => setOpen(true)}>Laporkan praktisi ini</button>;
  return (
    <Choice title="Apa yang terjadi?" onCancel={() => setOpen(false)}>
      {REPORT_REASONS.map((r) => (
        <button key={r} type="button" disabled={busy} onClick={() => send(r)}
          className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-left text-[13px] text-ink hover:border-app/50">{r}</button>
      ))}
    </Choice>
  );
}

function Choice({ title, onCancel, children }: { title: string; onCancel: () => void; children: ReactNode }) {
  return (
    <div className="grid gap-2 rounded-2xl bg-white p-3">
      <div className="flex items-center justify-between"><b className="text-[13px]">{title}</b>
        <button type="button" aria-label="Batal" className="text-muted" onClick={onCancel}><Icon name="x" size={16} /></button></div>
      {children}
      <small className="text-[11.5px] text-muted">Namamu tidak dikirim bersama laporan.</small>
    </div>
  );
}
