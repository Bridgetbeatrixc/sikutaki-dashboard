import type { Metadata } from "next";
import { CheckinScreen } from "@/features/employee/checkin/CheckinScreen";

export const metadata: Metadata = { title: "Check-in mingguan" };

export default function Page() {
  return <CheckinScreen />;
}
