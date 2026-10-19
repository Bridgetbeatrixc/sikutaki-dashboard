import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeScreen } from "@/features/employee/welcome/WelcomeScreen";
import { ROUTES } from "@/lib/paths";
import { getViewer } from "@/server/auth";

export const metadata: Metadata = { title: "Selamat datang" };

/** Shown once after joining; afterwards the app opens on Beranda. */
export default async function Page() {
  const viewer = await getViewer();
  if (viewer?.kind === "user" && viewer.user.onboarded) redirect(ROUTES.employee.home);
  return <WelcomeScreen />;
}
