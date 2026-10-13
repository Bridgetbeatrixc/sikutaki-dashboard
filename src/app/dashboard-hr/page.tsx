import type { Metadata } from "next";
import { OverviewPage } from "@/features/hr/overview/OverviewPage";

export const metadata: Metadata = { title: "Beranda" };

export default function Page() {
  return <OverviewPage />;
}
