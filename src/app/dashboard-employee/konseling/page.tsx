import type { Metadata } from "next";
import { CounselingScreen } from "@/features/employee/counseling/CounselingScreen";

export const metadata: Metadata = { title: "Konseling" };

export default function Page() {
  return <CounselingScreen />;
}
