import type { Metadata } from "next";
import { ReportsPage } from "@/features/hr/reports/ReportsPage";

export const metadata: Metadata = { title: "Laporan" };

export default function Page() {
  return <ReportsPage />;
}
