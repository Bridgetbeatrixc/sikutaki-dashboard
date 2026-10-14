import type { Metadata } from "next";
import { ContactPage } from "@/features/site/pages/ContactPage";

export const metadata: Metadata = { title: "Kontak", description: "Hubungi tim Sikutaki untuk pilot, demo, atau pertanyaan keamanan." };

export default function Page() {
  return <ContactPage />;
}
