import type { Metadata } from "next";
import { PricingPage } from "@/features/site/pages/PricingPage";

export const metadata: Metadata = { title: "Harga", description: "Mulai dengan pilot 3 bulan bersama satu tim." };

export default function Page() {
  return <PricingPage />;
}
