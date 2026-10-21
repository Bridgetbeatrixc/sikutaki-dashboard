import type { Metadata } from "next";
import { CounselingRequestsPage } from "@/features/hr/counseling/CounselingRequestsPage";

export const metadata: Metadata = { title: "Permintaan konseling" };

export default function Page() {
  return <CounselingRequestsPage />;
}
