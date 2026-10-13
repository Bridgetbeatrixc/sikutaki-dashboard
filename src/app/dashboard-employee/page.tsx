import type { Metadata } from "next";
import { WelcomeScreen } from "@/features/employee/welcome/WelcomeScreen";

export const metadata: Metadata = { title: "Kenalan" };

export default function Page() {
  return <WelcomeScreen />;
}
