"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { decimal } from "@/lib/format";
import { today, weekStart } from "@/lib/week";
import { companySummary, currentAccount, type CompanySummary } from "@/store/cloud";

/**
 * The company's real numbers from Supabase, next to the sample charts. Counts only; averages appear
 * once enough people have answered to keep everyone anonymous.
 */
export function LiveSummary() {
  const [s, setS] = useState<CompanySummary | null>(null);
  const signedIn = Boolean(currentAccount());
  useEffect(() => {
    if (signedIn) void companySummary(weekStart(today())).then(setS);
  }, [signedIn]);
  if (!signedIn || !s) return null;
  const avg = s.avgMood === null ? `Rata-rata mood dan tidur tampil setelah ${s.minGroup} orang mencatat minggu ini.`
    : `Rata-rata minggu ini: mood ${decimal(s.avgMood)}/5, tidur ${decimal(s.avgSleep ?? 0)} jam.`;
  return (
    <Card title="Data asli perusahaan Anda" sub="Dari database Sikutaki. Grafik di bawah masih memakai angka contoh sampai data cukup untuk dirata-rata.">
      <p className="text-[14px] text-body">
        <b className="text-ink">{s.employees}</b> karyawan bergabung · <b className="text-ink">{s.checkins}</b> check-in minggu ini · <b className="text-ink">{s.loggers}</b> orang mencatat mood minggu ini. {avg}
      </p>
    </Card>
  );
}
