import type { Metadata } from "next";
import { WelcomeScreen } from "@/features/employee/welcome/WelcomeScreen";

export const metadata: Metadata = { title: "Selamat datang" };

/** Shown once after joining; afterwards the app opens on Beranda. */
export default function Page() {
  return <WelcomeScreen />;
}
