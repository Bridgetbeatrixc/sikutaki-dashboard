import type { Metadata } from "next";
import { DivisionsPage } from "@/features/hr/divisions/DivisionsPage";

export const metadata: Metadata = { title: "Divisi" };

export default function Page() {
  return <DivisionsPage />;
}
