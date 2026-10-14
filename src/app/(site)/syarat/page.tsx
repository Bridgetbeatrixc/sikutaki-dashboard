import type { Metadata } from "next";
import { LegalPage } from "@/features/site/pages/LegalPage";

export const metadata: Metadata = { title: "Syarat dan ketentuan" };

export default function Page() {
  return <LegalPage kind="terms" />;
}
