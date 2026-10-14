import type { Metadata } from "next";
import { LegalPage } from "@/features/site/pages/LegalPage";

export const metadata: Metadata = { title: "Kebijakan privasi" };

export default function Page() {
  return <LegalPage kind="privacy" />;
}
