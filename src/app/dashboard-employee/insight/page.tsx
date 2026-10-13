import type { Metadata } from "next";
import { InsightScreen } from "@/features/employee/insight/InsightScreen";

export const metadata: Metadata = { title: "Insight" };

export default function Page() {
  return <InsightScreen />;
}
