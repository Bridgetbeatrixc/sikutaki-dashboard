import type { Metadata } from "next";
import { JoinPage } from "@/features/site/pages/JoinPage";

export const metadata: Metadata = { title: "Gabung" };

export default function Page() {
  return <JoinPage />;
}
