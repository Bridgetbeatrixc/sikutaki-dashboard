import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: { absolute: "Sikutaki | Kesehatan Mental Tim, Terukur Setiap Minggu" },
  description: "Check-in 3 menit untuk karyawan dan dashboard anonim untuk HR, memantau 17 area kesehatan mental.",
};

export default function Page() {
  return <LandingPage />;
}
