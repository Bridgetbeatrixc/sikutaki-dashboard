import type { Metadata } from "next";
import { CheckinPage } from "@/features/hr/checkin/CheckinPage";

export const metadata: Metadata = { title: "Check-in" };

export default function Page() {
  return <CheckinPage />;
}
