import type { Metadata } from "next";
import { AboutPage } from "@/features/site/pages/AboutPage";

export const metadata: Metadata = { title: "Tentang kami", description: "Kenapa Sikutaki ada, prinsip kami, dan perjalanan dari scan foto ke kesehatan mental tim." };

export default function Page() {
  return <AboutPage />;
}
