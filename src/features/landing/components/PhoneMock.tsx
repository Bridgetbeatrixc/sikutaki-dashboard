/* eslint-disable @next/next/no-img-element */
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/paths";
import { Ring } from "./Ring";
import { Track } from "./ui";

const RESULT_BARS: [string, number, string][] = [
  ["Baterai Sosial", 72, "#E39B3B"],
  ["Overthinking", 54, "#7B61D1"],
  ["Insomnia", 40, "#3D7FD9"],
];
const ANSWERS = ["Tidak pernah", "Kadang-kadang", "Sering", "Hampir setiap hari"];
const SELECTED_ANSWER = 2;
const NAV: { icon: IconName; label: string }[] = [
  { icon: "home", label: "Beranda" }, { icon: "trend", label: "Hasil" }, { icon: "chat", label: "Konsultasi" }, { icon: "user", label: "Profil" },
];

const phoneCard = "grid gap-2.5 rounded-[20px] bg-white p-3.5 shadow-[0_4px_14px_rgba(0,0,0,.06)]";
const screenBg = "bg-[linear-gradient(180deg,#e4e9f4_0%,#f6f8fb_34%,#f6f8fb_100%)]";

/** Static picture of the employee app inside a phone frame. */
export function PhoneMock({ screen = "home" }: { screen?: "home" | "checkin" }) {
  const label = screen === "home" ? "Contoh tampilan aplikasi karyawan Sikutaki" : "Contoh layar check-in Sikutaki";
  return (
    <div role="img" aria-label={label}
      className="relative w-[300px] rounded-[46px] bg-[#1d1d1f] p-[11px] text-left shadow-[0_40px_80px_rgba(0,0,0,.28),inset_0_0_0_2px_#3a3a3c]">
      {screen === "home" ? <HomeScreen /> : <CheckinScreen />}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-2 pt-0.5 pb-1 text-[13px] font-semibold">
      <span>09.41</span>
      <span className="h-6 w-[84px] rounded-full bg-[#1d1d1f]" />
      <span className="flex items-end gap-0.5">
        {[4, 6, 8, 10].map((h) => <i key={h} className="block w-[3px] rounded-[1px] bg-ink" style={{ height: h }} />)}
        <b className="ml-[5px] block h-2.5 w-5 rounded-[3px] border-[1.5px] border-ink bg-[linear-gradient(90deg,var(--color-ink)_70%,transparent_70%)] bg-clip-content p-px" />
      </span>
    </div>
  );
}

function HomeScreen() {
  return (
    <>
      <div className={cn("grid gap-3 rounded-t-[36px] px-3.5 pt-3 pb-3.5 text-[13px] text-ink", screenBg)}>
        <StatusBar />
        <div className="flex items-center gap-2.5">
          <img src={asset("/img/avatar-rina.jpg")} alt="" width={40} height={40} className="size-10 rounded-full border-2 border-white object-cover shadow-[0_2px_8px_rgba(0,0,0,.15)]" />
          <div><small className="block text-xs text-muted">Selamat pagi</small><b className="text-[17px] font-bold text-head">Rina</b></div>
          <span className="ml-auto inline-flex size-9 items-center justify-center rounded-full bg-white"><Icon name="bell" size={18} /></span>
        </div>

        <div className={cn(phoneCard, "grid-cols-[1fr_auto] items-center bg-[linear-gradient(135deg,var(--color-brand-2),var(--color-brand))] text-white")}>
          <div className="min-w-0"><small className="block text-xs whitespace-nowrap text-[#dbe9fe]">Check-in minggu ini</small><b className="text-[15px] font-bold whitespace-nowrap">3 menit saja</b></div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-brand">Mulai <Icon name="arrow" size={15} /></span>
        </div>

        <div className={phoneCard}>
          <div className="flex items-center gap-3">
            <Ring value={72} size={58} color="#3B8EF7" label="72" />
            <div>
              <small className="block text-xs text-muted">Kondisimu minggu ini</small>
              <b className="text-[15px] font-bold">Cukup baik</b>
              <em className="block text-xs font-semibold text-brand-2 not-italic">naik 5 poin</em>
            </div>
          </div>
          {RESULT_BARS.map(([name, v, color]) => (
            <div key={name} className="grid grid-cols-[96px_1fr_22px] items-center gap-2 text-[12.5px]">
              <span>{name}</span><Track value={v} color={color} className="h-[7px]" /><b className="num text-right font-semibold">{v}</b>
            </div>
          ))}
        </div>

        <div className={cn(phoneCard, "grid-cols-[auto_1fr_auto] items-center gap-3")}>
          <img src={asset("/img/avatar-psikolog.jpg")} alt="" width={44} height={44} className="size-11 rounded-[14px] border-2 border-white object-cover shadow-[0_2px_8px_rgba(0,0,0,.15)]" />
          <div className="min-w-0"><small className="block text-xs whitespace-nowrap text-muted">Psikolog mitra</small><b className="text-[15px] font-bold whitespace-nowrap">Rabu 20.00</b></div>
          <span className="rounded-full bg-mint px-2.5 py-[7px] text-[11.5px] font-bold text-brand">Jadwalkan</span>
        </div>
      </div>
      <div className="grid grid-cols-4 rounded-b-[36px] border-t border-line bg-white px-1.5 pt-2.5 pb-4 text-[#939ba5]">
        {NAV.map((n, i) => (
          <span key={n.label} className={cn("grid justify-items-center gap-[3px] text-[10.5px] font-semibold", i === 0 && "text-brand")}>
            <Icon name={n.icon} size={19} />{n.label}
          </span>
        ))}
      </div>
    </>
  );
}

function CheckinScreen() {
  return (
    <div className={cn("grid min-h-[600px] content-start gap-3.5 rounded-[36px] px-3.5 pt-3 pb-[22px] text-[13px] text-ink", screenBg)}>
      <StatusBar />
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-[34px] rotate-180 items-center justify-center rounded-full bg-white"><Icon name="arrow" size={16} /></span>
        <span className="font-mono text-xs text-muted">Pertanyaan 2 dari 6</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#dbe1e9]"><span className="block h-full w-1/3 rounded-full bg-brand-2" /></div>
      <span className="mt-1.5 justify-self-start rounded-full bg-[#efebfb] px-[11px] py-[5px] text-xs font-bold text-mind">Overthinking</span>
      <p className="text-xl leading-snug font-semibold tracking-tight text-head">Seminggu terakhir, seberapa sering kamu sulit berhenti memikirkan pekerjaan?</p>
      <div className="mt-1 grid gap-[9px]">
        {ANSWERS.map((a, i) => {
          const on = i === SELECTED_ANSWER;
          return (
            <span key={a} className={cn("flex items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-[13px] text-[14.5px]",
              on ? "border-brand-2 bg-[#f0f3f9] font-bold text-brand" : "border-line bg-white font-medium")}>
              <i className={cn("size-[18px] shrink-0 rounded-full", on ? "border-5 border-brand-2" : "border-2 border-[#c3cad3]")} />{a}
            </span>
          );
        })}
      </div>
      <span className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-[linear-gradient(135deg,var(--color-brand-2),var(--color-brand))] p-3.5 text-[15px] font-bold text-white">
        Lanjut <Icon name="arrow" size={15} />
      </span>
    </div>
  );
}
