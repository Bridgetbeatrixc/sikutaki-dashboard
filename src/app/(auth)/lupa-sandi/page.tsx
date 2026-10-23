import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/features/site/pages/PasswordPages";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function Page() {
  return <ForgotPasswordPage />;
}
