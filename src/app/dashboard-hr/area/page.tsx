import type { Metadata } from "next";
import { AreasPage } from "@/features/hr/areas/AreasPage";

export const metadata: Metadata = { title: "42 Area" };

export default function Page() {
  return <AreasPage />;
}
