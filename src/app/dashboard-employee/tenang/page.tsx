import type { Metadata } from "next";
import { CalmScreen } from "@/features/employee/calm/CalmScreen";

export const metadata: Metadata = { title: "Tenangkan diri" };

export default function Page() {
  return <CalmScreen />;
}
