import type { Metadata } from "next";
import { NewPasswordPage } from "@/features/site/pages/PasswordPages";

export const metadata: Metadata = { title: "Kata sandi baru" };

export default function Page() {
  return <NewPasswordPage />;
}
