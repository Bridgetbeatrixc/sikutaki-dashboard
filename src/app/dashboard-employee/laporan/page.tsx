import type { Metadata } from "next";
import { ReportScreen } from "@/features/employee/report/ReportScreen";

export const metadata: Metadata = { title: "Laporan pribadi" };

export default function Page() {
  return <ReportScreen />;
}
