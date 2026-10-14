import type { Metadata } from "next";
import { SignupPage } from "@/features/site/pages/SignupPage";

export const metadata: Metadata = { title: "Daftar" };

export default function Page() {
  return <SignupPage />;
}
