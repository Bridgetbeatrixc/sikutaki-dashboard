import type { Metadata } from "next";
import { SecurityPage } from "@/features/site/pages/SecurityPage";

export const metadata: Metadata = { title: "Keamanan dan privasi", description: "Aturan minimal 5 orang, data pribadi, dan layanan krisis." };

export default function Page() {
  return <SecurityPage />;
}
